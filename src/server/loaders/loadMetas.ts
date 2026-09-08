import { set, get } from 'lodash-es'
import { unflatten } from '#shared/utils/flatten.ts'
import { defineLoader } from '#server/utils/defineLoader.ts'

interface RepositoryMeta {
    name: string
    value: any
}

interface LoadMetasOptions {
    findMany(ids: any[]): Promise<RepositoryMeta[]>
    entityIdKey?: string
    foreignKey?: string
    targetKey?: string
}

export async function loadMetas<T extends Record<string, any>>(payload: T | T[], options: LoadMetasOptions) {
    const entityIdKey = options?.entityIdKey || 'id'
    const foreignKey = options?.foreignKey || 'id'
    const targetKey = options?.targetKey || 'metas'
    const findMany = options.findMany

    const entities = Array.isArray(payload) ? payload : [payload]
    const idList = new Set<string>()

    entities.forEach(entity => idList.add(get(entity, entityIdKey)))

    const metas = await findMany(Array.from(idList.values()))

    for (const entity of entities) {
        const entityId = get(entity, entityIdKey)

        const entityMetas = metas.filter(meta => get(meta, foreignKey) === entityId)

        let record = Object.fromEntries(entityMetas.map(meta => [meta.name, meta.value])) as Record<string, any>

        Object.keys(record).forEach(key => {
            const value = record[key]

            if (!value) {
                return
            }

            if (value.startsWith('number:')) {
                record[key] = Number(value.slice(7))
            }
        })

        record = unflatten(record)

        set(entity, targetKey, record)
    }
}

export function createMetasLoader<T extends Record<string, any>>(options: LoadMetasOptions) {
    return defineLoader<T>({ load: (entities) => loadMetas(entities, options), })
}
