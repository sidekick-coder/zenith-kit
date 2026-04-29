import type { Constructor } from '#shared/utils/compose.ts'

export interface Listener {
    event: string
    listener: (...args: any[]) => void
}

export async function emitHook(constructor: any, event: string, ...args: any[]) {                
    const listeners = constructor.listeners || []

    for await (const l of listeners.filter((l: any) => l.event === event)) {
        await l.listener(...args)
    }
}

export function onHook(constructor: any, event: string, listener: (...args: any[]) => void) {
    const listeners = constructor.listeners || []

    const exists = listeners.find((l: any) => l.event === event && l.listener === listener)

    if (exists) {
        return
    }

    listeners.push({ 
        event,
        listener 
    })

    constructor.listeners = listeners
}

export function HooksStatic<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        constructor(...args: any[]) {
            super(...args)
                
            if (typeof (this.constructor as any).boot === 'function') {
                (this.constructor as any).boot.apply(this.constructor)
            }
        }

        public static listeners = [] as Array<(...args: any[]) => void>

        public static on(event: string, listener: (...args: any[]) => void) {
            return onHook(this, event, listener)
        }

        public static async emit(event: string, ...args: any[]) {
            return emitHook(this, event, ...args)
        }
    }
}

export default function Hooks<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        public listeners: Listener[]

        constructor(...args: any[]) {
            super(...args)
            this.listeners = []
        }

        public on(event: string, listener: (...args: any[]) => void) {
            this.listeners.push({ 
                event,
                listener 
            })
        }

        public off(event: string, listener: (...args: any[]) => void) {
            const index = this.listeners.findIndex((l) => l.event === event && l.listener === listener)

            
            if (index === -1) {
                return
            }
            
            this.listeners.splice(index, 1)
        }

        public emit(event: string, ...args: any[]) {
            const listeners = this.listeners.filter((l) => l.event === event)


            for (const l of listeners) {
                l.listener(...args)
            }
        }
        
        public async emitAsync(event: string, ...args: any[]) {
            const listeners = this.listeners.filter((l) => l.event === event)

            for await (const l of listeners) {
                await l.listener(...args)
            }
        }
    }
}

HooksStatic.emit = emitHook
HooksStatic.on = onHook
