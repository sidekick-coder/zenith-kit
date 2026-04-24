import { debounce } from 'lodash-es'
import { createId, tryCatch } from '../utils/index.ts'
import LoggerService from './LoggerService.ts'

interface EmmitterHandler {
    id: string
    event: string
    listener: (...args: any[]) => any
    originalListener?: (...args: any[]) => any
}

interface OnOptions {
    id?: string
    unique?: boolean
}

interface OnDebounceOptions extends OnOptions {
    debounce?: number
}

export interface EmmitterServiceOptions {
    debug?: boolean
    logger?: LoggerService
}

export default class EmmitterService<Events extends Record<string, any> = Record<string, any>> {
    private handlers: EmmitterHandler[] = []
    private debug: boolean
    private logger: LoggerService

    public load(options?: EmmitterServiceOptions) {
        this.debug = options?.debug || false
        this.logger = options?.logger || new LoggerService()

        if (this.debug) {
            this.logger.debug('emmitter loaded with debug mode enabled')
        }
    }

    public on<K extends keyof Events>(event: K, listener: (args: Events[K]) => void, options?: OnOptions): EmmitterHandler
    public on(event: string, listener: (args: any) => void, options?: OnOptions): EmmitterHandler
    public on(event: string, listener: EmmitterHandler['listener'], options?: OnOptions) {
        const id = options?.id || createId()

        if (options?.unique) {
            const exists = this.handlers.some(h => (h.event === event && h.listener === listener) || h.id === id)

            if (exists) {
                return
            }
        }

        const handler: EmmitterHandler = {
            id,
            event,
            listener
        }

        this.handlers.push(handler)

        if (this.debug) {
            this.logger.debug('handler added', handler)
        }

        return handler
    }

    public once<K extends keyof Events>(event: K, listener: (args: Events[K]) => void, options?: OnOptions): EmmitterHandler
    public once(event: string, listener: (args: any) => void, options?: OnOptions): EmmitterHandler
    public once(event: string, listener: EmmitterHandler['listener'], options?: OnOptions) {
        const wrapper = (args: any) => {
            listener(args)

            this.off(event, wrapper)
        }

        return this.on(event, wrapper, options)
    }


    public onDebounce<K extends keyof Events>(event: K, listener: (args: Events[K]) => void, options?: OnDebounceOptions): EmmitterHandler
    public onDebounce(event: string, listener: (args: any) => void, options?: OnDebounceOptions): EmmitterHandler
    public onDebounce(event: string, listener: EmmitterHandler['listener'], options?: OnDebounceOptions) {
        const debounced = debounce(listener, options?.debounce || 300)

        const handler = this.on(event, debounced, options)

        if (handler) {
            handler.originalListener = listener
        }

        return handler
    }

    public onAnyOf<K extends keyof Events>(events: K[], listener: (args: Events[K]) => void, options?: OnOptions): EmmitterHandler[]
    public onAnyOf(events: string[], listener: (args: any) => void, options?: OnOptions): EmmitterHandler[]
    public onAnyOf(events: string[], listener: Function, options?: OnOptions) {
        const handlers: EmmitterHandler[] = []

        for (const event of events) {
            const handler = this.on(event, listener as any, options)

            if (handler) {
                handlers.push(handler)
            }
        }

        return handlers
    }

    public off(event: string, listener: Function) {
        this.handlers = this.handlers.filter(h => {
            if (h.event === event && (h.listener === listener || h.originalListener === listener)) {
                return false
            }

            return true
        })

        if (this.debug) {
            this.logger.debug('handler removed', { event })
        }
    }

    public emit<K extends keyof Events>(event: K, args: Events[K]): void
    public emit(event: string, args?: any): void
    public emit(event: string, args?: any) {

        if (this.debug) {
            this.logger.debug('emitting event', {
                event,
                args
            })
        }

        const handlers = this.handlers.filter(h => h.event === event)

        for (const handler of handlers) {
            tryCatch.sync(() => handler.listener(args))
        }
    }

    public async emitAndWait<K extends keyof Events>(event: K, args: Events[K]): Promise<void>
    public async emitAndWait(event: string, args?: any): Promise<void>
    public async emitAndWait(event: string, args?: any) {


        const handlers = this.handlers.filter(h => h.event === event)

        if (this.debug) {
            this.logger.debug('emitting event', {
                handlers: handlers.length,
                event,
                args
            })
        }

        for await (const handler of handlers) {
            await handler.listener(args)
        }
    }


    public list() {
        return this.handlers
    }

    public listByEvent(event: string) {
        return this.handlers.filter(h => h.event === event)
    }

    public remove(payload: string | string[]) {
        const ids = Array.isArray(payload) ? payload : [payload]

        this.handlers = this.handlers.filter(h => !ids.includes(h.id))

        if (this.debug) {
            this.logger.debug('handlers removed', { ids })
        }
    }

    public clear() {
        this.handlers = []

        if (this.debug) {
            this.logger.debug('all handlers cleared')
        }
    }

    public hasHandlers() {
        return this.handlers.length > 0
    }
}
