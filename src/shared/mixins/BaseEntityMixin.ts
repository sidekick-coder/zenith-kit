import type { Constructor } from '#shared/utils/compose.ts'

interface CreateBaseEntityOptions {
    parse?: (data: any) => any
}

export function createBaseEntity(options: CreateBaseEntityOptions = {}) {
    return function BaseEntity<TBase extends Constructor>(Base: TBase) {
        return class extends Base {
            public static from<T>(this: new () => T, data: Partial<T>): T {
                const contructor = (typeof this === 'function' ? this : Base) as any
            
                const instance = new contructor() as any

                let payload = { ...data }
            
                if (options.parse) {
                    payload = options.parse(data)
                }

                Object.assign(instance as any, payload)

                return instance
            }

            public merge(data: Partial<this>): this {
                Object.assign(this, data)
                return this
            }
        }
    }
}

export default function BaseEntity<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        public static from<T>(this: new () => T, data: Partial<T>): T {
            const contructor = (typeof this === 'function' ? this : Base) as any
            
            const instance = new contructor() as any

            let payload = { ...data }
            
            if (typeof contructor?.parse === 'function') {
                payload = (contructor as any).parse(data)
            }
            
            if (typeof (this as any)?.parse === 'function') {
                payload = (this as any).parse(data)
            }

            Object.assign(instance as any, payload)

            return instance
        }

        public merge(data: Partial<this>): this {
            Object.assign(this, data)
            return this
        }
    }
}
