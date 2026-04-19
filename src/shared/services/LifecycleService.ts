import LoggerService from './LoggerService.ts'
import type LifecycleHook from '../entities/LifecycleHook.ts'
import type { Constructor } from '../utils/compose.ts'
import { tryCatch } from '../utils/tryCatch.ts'

interface ListOptions {
    exclude?: (string | Constructor<LifecycleHook> | LifecycleHook)[]
}

export default class LifecycleService {
    public hooks: Map<string, LifecycleHook>
    public logger: LoggerService
    public debug = false

    constructor(data: Partial<LifecycleService> = {}) {
        this.debug = data.debug ?? this.debug
        this.hooks = data.hooks ?? new Map()
        this.logger = data.logger ?? new LoggerService()
    }

    private async executeHookMethod(hook: LifecycleHook, method: 'onRegister' | 'onLoad' | 'onBoot' | 'onShutdown'): Promise<void> {
        await hook[method]()

        if (hook.subhooks) {
            for (const subhook of hook.subhooks) {
                await this.executeHookMethod(subhook, method)
            }
        }
    }

    public list(options?: ListOptions){
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
        }
    }

    public async register(options?: ListOptions): Promise<void> {
        for (const hook of this.list(options)) {
            const [error] = await tryCatch(() => this.executeHookMethod(hook, 'onRegister'))
            
            if (error) {
                Object.assign(error, { hookId: hook.hook_id })
                this.logger.error('error in hook register: ', error)
                continue
            }
            
            if (this.debug) {
                this.logger.debug('register ' + hook.hook_id)
            }
        }
    }

    public async load(options?: ListOptions): Promise<void> {
        for (const hook of this.list(options)) {
            const [error] = await tryCatch(() => this.executeHookMethod(hook, 'onLoad'))
            
            if (error) {
                Object.assign(error, { hookId: hook.hook_id })
                this.logger.error('error in hook load:', error)
                continue
            }
            
            if (this.debug) {
                this.logger.debug('load ' + hook.hook_id)
            }
        }
    }

    public async boot(options?: ListOptions): Promise<void> {
        const hooks = this.list(options)

        for (const hook of hooks) {
            const [error] = await tryCatch(() => this.executeHookMethod(hook, 'onBoot'))
            
            if (error) {
                Object.assign(error, { hookId: hook.hook_id })
                this.logger.error('error in hook boot:', error)
                continue
            }
            
            if (this.debug) {
                this.logger.debug('boot ' + hook.hook_id)
            }
        }
    }

    public async shutdown(options?: ListOptions): Promise<void> {
        for (const hook of this.list(options)) {
            const [error] = await tryCatch(() => this.executeHookMethod(hook, 'onShutdown'))
            
            if (error) {
                Object.assign(error, { hookId: hook.hook_id })
                this.logger.error('error in hook shutdown:', error)
                continue
            }
            
            if (this.debug) {
                this.logger.debug('shutdown ' + hook.hook_id)
            }
        }
    }

    public clear(): void {
        this.hooks.clear()
    }

}
