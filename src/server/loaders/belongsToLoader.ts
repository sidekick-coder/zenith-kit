import { set, get } from 'lodash-es'
import { defineLoader } from '#server/utils/defineLoader.ts'

type KeyOrFunction<T> = keyof T | ((entity: T) => any)

interface BelongsToLoaderOptions<
    TEntity extends Record<string, any> = Record<string, any>,
    TTargetEntity extends Record<string, any> = Record<string, any>
> {
    key: string // target property to set on the entity
    sourceKey: KeyOrFunction<TEntity> // property to get the related entity id from the entity
    targetKey: KeyOrFunction<TTargetEntity> // property to get the related entity from the target entity
    findEntities(ids: (string | number)[]): Promise<TEntity[]> // function to fetch pivot table rows by related entity ids
}

export async function loadBelongsTo<T extends Record<string, any>, U extends Record<string, any>>(payload: T | T[], options: BelongsToLoaderOptions<T, U>) {
    const entities = Array.isArray(payload) ? payload : [payload]
    const key = options.key
    const sourceKey = options.sourceKey
    const targetKey = options.targetKey


    function findKey(entity: any, keyOrFn: KeyOrFunction<any>): any {
        if (typeof keyOrFn === 'function') {
            return keyOrFn(entity)
        }

        return get(entity, keyOrFn)

    }

    const ids = entities.map(e => findKey(e, sourceKey))
        .filter(id => id !== undefined && id !== null)
        .filter((value, index, self) => self.indexOf(value) === index)

    if (!ids.length) {
        return
    }

    const targetEntities = await options.findEntities(ids)

    for (const entity of entities) {
        const targetEntity = targetEntities.find((t: any) => findKey(t, targetKey) === findKey(entity, sourceKey))

        if (targetEntity) {
            set(entity, key, targetEntity)
        }
    }
}


export function createBelongsToLoader<
    T extends Record<string, any> = Record<string, any>,
    U extends Record<string, any> = Record<string, any>
>(options: BelongsToLoaderOptions<T, U>) {
    return defineLoader<T>({
        load: async (entities: T[]) => loadBelogsTo<T, U>(entities, options)
    })
}


