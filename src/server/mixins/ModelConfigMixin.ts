import { HooksStatic } from '#shared/mixins/HooksMixin.ts'
import type { Constructor } from '#shared/utils/compose.ts'
import config from '#server/facades/config.ts'
import BaseException from '#shared/exceptions/BaseException.ts'

export type ConfigModel = ReturnType<ReturnType<typeof ModelConfig>>

interface Options {
    readonly?: boolean
}

export default function ModelConfig(key: string, options: Options = {}) {
    return function ConfigModelMixinExtend<TBase extends Constructor>(Base: TBase) {
        return class extends Base {
            public static __isConfigModel = true

            public static serialize<T>(this: new (...args: any[]) => T, row: any): Promise<T> {
                const instance = new this() as any

                Object.assign(instance as any, row)

                return instance as any
            }

            public static async list<T>(this: new (...args: any[]) => T): Promise<T[]> {
                const constructor = this as any

                const map = config.get<Record<string, any>>(key) || {}

                const items = []

                for (const [id, k] of Object.entries(map)) {
                    const item = constructor.serialize(JSON.parse(JSON.stringify({
                        ...k, 
                        id 
                    })))

                    items.push(item)
                }

                await HooksStatic.emit(this, 'afterList', items)

                return items as any
            }

            public static async find<T>(this: new (...args: any[]) => T, id: string): Promise<T | null> {
                const constructor = this as any as ConfigModel

                const all = await constructor.list()

                const data = all.find(i => (i as any).id === id)

                if (!data) {
                    return null
                }

                const item = JSON.parse(JSON.stringify(data))

                await HooksStatic.emit(this, 'afterFind', item)

                return (item || null) as any
            }

            public static async findOrFail<T>(this: new (...args: any[]) => T, id: string): Promise<T> {
                const constructor = this as any as ConfigModel

                const item = await constructor.find(id)

                if (!item) {
                    throw new Error('Entity item not found')
                }

                return item as any
            }

            public static async create<T>(this: new (...args: any[]) => T, item: T & { id: string }): Promise<void> {
                if (options.readonly) {
                    throw new BaseException('Readonly config model')
                }

                if (!item.id) {
                    throw new Error('Entity item requires an id')
                }

                const constructor = this as any as ConfigModel

                const map = config.get<Record<string, any>>(key) || {}

                if (map[item.id]) {
                    throw new Error('Entity item already exists')
                }

                await HooksStatic.emit(this, 'beforeCreate', item)

                map[item.id] = { ...item } as any

                delete map[item.id].id

                await config.set(key, map)

                return constructor.findOrFail(item.id) as any
            }

            public static async update<T>(this: new (...args: any[]) => T, id: string, data: T): Promise<void> {
                if (options.readonly) {
                    throw new BaseException('Readonly config model')
                }

                const constructor = this as any as ConfigModel

                const map = config.get<Record<string, any>>(key) || {}

                if (!map[id]) {
                    throw new Error('Entity item not found')
                }

                await HooksStatic.emit(this, 'beforeUpdate', data)

                Object.assign(map[id], data)

                await config.set(key, map)

                return constructor.findOrFail(id) as any
            }

            public static async updateOrCreate<T>(this: new (...args: any[]) => T, id: string, data: Partial<T>): Promise<void> {
                const constructor = this as any as ConfigModel

                const existing = await constructor.find(id)

                if (existing) {
                    return constructor.update(id, data as any) as any
                }

                return constructor.create({ 
                    ...(data as any),
                    id 
                }) as any
            }

            public static async destroy<T>(this: new (...args: any[]) => T, id: string): Promise<void> {
                if (options.readonly) {
                    throw new BaseException('Readonly config model')
                }

                const map = config.get<Record<string, any>>(key) || {}

                if (!map[id]) {
                    throw new Error('Entity item not found')
                }

                delete map[id]

                await config.set(key, map)
            }
        }
    }
}
