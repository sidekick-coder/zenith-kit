import LoggerService from './LoggerService.ts'
import type LifecycleHook from '#shared/entities/LifecycleHook.ts'
import type { Constructor } from '#shared/utils/compose.ts'
import { tryCatch } from '../utils/tryCatch.ts'

type LifecycleMethod = 'register' | 'load' | 'boot' | 'shutdown'

interface ListOptions {
    include?: string | string[]
    exclude?: string | string[]
}

export interface LifecycleServiceOptions {
    debug?: boolean
    hooks?: Map<string, LifecycleHook>
    logger?: LoggerService
    onError?: (error: Error, context: { hookId: string; method: LifecycleMethod }) => void
}

export default class LifecycleService {
    public static __container_entry_key = 'LifecycleService'

    public hooks: Map<string, LifecycleHook>
    public logger: LoggerService
    public debug = false

    constructor(data: LifecycleServiceOptions = {}) {
        this.debug = data.debug ?? this.debug
        this.hooks = data.hooks ?? new Map()
        this.logger = data.logger ?? new LoggerService()
        
        if (data.onError) {
            this.onError = data.onError
        }
    }

    public onError(error: Error, context: { hookId: string; method: LifecycleMethod }) {
        Object.assign(error, { context })

        this.logger.error(`Error in hook ${context.method} (${context.hookId}):`, error)
    }

    public mapAliases(args: string[]) {
        const result: string[] = []
        const all = Array.from(this.hooks.values())

        for (const hook of all) {
            if (args.includes(hook.hook_id)) {
                result.push(hook.hook_id)
                continue
            }

            if (hook.hook_aliases) {
                const matchedAlias = hook.hook_aliases.find(alias => args.includes(alias))

                if (matchedAlias) {
                    result.push(hook.hook_id)
                }
            }
        }

        return result
    }

    public list(options?: ListOptions) {
        let hooks = Array.from(this.hooks.values())

        if (options?.exclude) {
            let ids = Array.isArray(options.exclude) ? options.exclude : [options.exclude]

            ids = this.mapAliases(ids)

            hooks = hooks.filter(hook => !ids.includes(hook.hook_id))
        }

        if (options?.include) {
            let ids = Array.isArray(options.include) ? options.include : [options.include]

            ids = this.mapAliases(ids)

            hooks = hooks.filter(hook => ids.includes(hook.hook_id))
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
            if (!hook.hook_id) {
                this.logger.warn('Skipping hook without hook_id:', hook)
                continue
            }

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
                this.onError(error, { hookId: hook.hook_id, method })
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
