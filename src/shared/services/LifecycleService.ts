import LoggerService from './LoggerService.ts'
import type LifecycleHook from '#shared/entities/LifecycleHook.ts'
import type { Constructor } from '#shared/utils/compose.ts'
import { tryCatch } from '../utils/tryCatch.ts'

type LifecycleMethod = 'register' | 'load' | 'boot' | 'shutdown'

interface ListOptions {
    exclude?: (string | Constructor<LifecycleHook> | LifecycleHook)[]
}

export default class LifecycleService {
    public static __container_entry_key = 'LifecycleService'

    public hooks: Map<string, LifecycleHook>
    public logger: LoggerService
    public debug = false

    constructor(data: Partial<LifecycleService> = {}) {
        this.debug = data.debug ?? this.debug
        this.hooks = data.hooks ?? new Map()
        this.logger = data.logger ?? new LoggerService()
    }

    public list(options?: ListOptions) {
        let hooks = Array.from(this.hooks.values())

        if (options?.exclude) {
            const ids = options.exclude.filter(item => typeof item === 'string') as string[]
            const constructors = options.exclude.filter(item => typeof item === 'function') as Constructor<LifecycleHook>[]
            const instances = options.exclude.filter(item => typeof item === 'object') as LifecycleHook[]
            hooks = hooks.filter(hook => {
                if (ids.includes(hook.hook_id)) {
                    return false
                }

                if (constructors.find(ctor => hook instanceof ctor)) {
                    return false
                }

                if (instances.find(inst => hook === inst)) {
                    return false
                }

                return true
            })
        }

        hooks.sort((a, b) => {
            const orderA = a.order ?? 0
            const orderB = b.order ?? 0
            return orderA - orderB
        })

        return hooks
    }

    public add(...payload: (LifecycleHook | Constructor<LifecycleHook>)[]): void {
        const instances: LifecycleHook[] = []

        for (const item of payload) {
            if (typeof item === 'function') {
                instances.push(new item())
                continue
            }

            instances.push(item)
        }

        for (const hook of instances) {
            this.hooks.set(hook.hook_id, hook)

            if (this.debug) {
                this.logger.debug('add ' + hook.hook_id)
            }

            if (hook.subhooks) {
                hook.subhooks.forEach(subhook => this.add(subhook))
            }
        }
    }

    public async emitMethod(method: LifecycleMethod, options?: ListOptions): Promise<void> {
        for (const hook of this.list(options)) {
            const map = {
                register: () => Promise.all([hook.register(), hook.onRegister()]),
                load: () => Promise.all([hook.load(), hook.onLoad()]),
                boot: () => Promise.all([hook.boot(), hook.onBoot()]),
                shutdown: () => Promise.all([hook.shutdown(), hook.onShutdown()]),
            }

            const [error] = await tryCatch(() => map[method]())

            if (error) {
                Object.assign(error, { hookId: hook.hook_id })
                this.logger.error(`error in hook ${method}:`, error)
                continue
            }

            if (this.debug) {
                this.logger.debug(`${method} ` + hook.hook_id)
            }
        }
    }

    public async emit(payload: LifecycleMethod | LifecycleMethod[], options?: ListOptions): Promise<void> {
        const methods = Array.isArray(payload) ? payload : [payload]

        for (const method of methods) {
            await this.emitMethod(method, options)
        }
    }

    public async register(options?: ListOptions): Promise<void> {
        return this.emit('register', options)
    }

    public async load(options?: ListOptions): Promise<void> {
        return this.emit('load', options)
    }

    public async boot(options?: ListOptions): Promise<void> {
        return this.emit('boot', options)
    }

    public async shutdown(options?: ListOptions): Promise<void> {
        await this.emit('shutdown', options)
    }

    public clear(): void {
        this.hooks.clear()
    }
}
