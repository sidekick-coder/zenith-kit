import { set, get } from 'lodash-es'
import { defineLoader } from '#server/utils/defineLoader.ts'

type KeyOrFunction<T> = keyof T | ((entity: T) => any)

export interface HasManyThroughLoaderOptions<
    TEntity extends Record<string, any> = Record<string, any>,
    TPivotEntity extends Record<string, any> = Record<string, any>,
    TTargetEntity extends Record<string, any> = Record<string, any>
> {
    key: string // target property to set on the entity
    pivot: {
        sourceKey: KeyOrFunction<TEntity> // pivot table foreign key to related entity
        targetKey: KeyOrFunction<TPivotEntity> // pivot table foreign key to current entity
        findEntities(ids: (string | number)[]): Promise<TPivotEntity[]> // function to fetch pivot table rows by related entity ids
    },
    target: {
        sourceKey: KeyOrFunction<TPivotEntity> // target entity id key, default 'id'
        targetKey: KeyOrFunction<TTargetEntity> // target entity foreign key to pivot table
        findEntities(ids: (string | number)[]): Promise<TTargetEntity[]> // function to fetch related entities by ids
    }
}

export async function loadHasManyThrough<
    TEntity extends Record<string, any> = Record<string, any>,
    TPivotEntity extends Record<string, any> = Record<string, any>,
    TTargetEntity extends Record<string, any> = Record<string, any>
>(payload: any | any[], options: HasManyThroughLoaderOptions<TEntity, TPivotEntity, TTargetEntity>) {
    const entities = Array.isArray(payload) ? payload : [payload]
    const target = options.target 
    const pivot = options.pivot

    function findKey(entity: any, keyOrFn: KeyOrFunction<any>): any {
        if (typeof keyOrFn === 'function') {
            return keyOrFn(entity)
        }

        return get(entity, keyOrFn)
        
    }

    const pivoIds = entities.map(e => findKey(e, pivot.sourceKey)).filter(Boolean)
    const pivotEntities = await pivot.findEntities(pivoIds)
    const targetIds = pivotEntities.map((p: any) => findKey(p, pivot.targetKey)).filter(Boolean)
    const targetEntities = await target.findEntities(targetIds)

    for (const entity of entities) {
        const pivots = pivotEntities.filter((p: any) => findKey(p, pivot.sourceKey) === findKey(entity, pivot.sourceKey))

        if (!pivots.length) {
            set(entity, options.key, [])
            continue
        }

        const targets = targetEntities.filter((t: any) => pivots.some((p: any) => findKey(p, target.sourceKey) === findKey(t, target.targetKey)))

        set(entity, options.key, targets)
    }

}

export function createHasManyThroughLoader<
    TEntity extends Record<string, any> = Record<string, any>,
    TPivotEntity extends Record<string, any> = Record<string, any>,
    TTargetEntity extends Record<string, any> = Record<string, any>
>(options: HasManyThroughLoaderOptions<TEntity, TPivotEntity, TTargetEntity>) {
    return defineLoader<TEntity>({
        load: async (entities: TEntity[]) => loadHasManyThrough(entities, options)
    })
}


