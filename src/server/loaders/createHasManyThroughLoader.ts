import { set, get } from 'lodash-es'
import { defineLoader } from '#server/utils/defineLoader.ts'

export interface HasManyThroughLoaderOptions<
    TEntity extends Record<string, any> = Record<string, any>,
    TPivotEntity extends Record<string, any> = Record<string, any>,
    TTargetEntity extends Record<string, any> = Record<string, any>
> {
    key: string // target property to set on the entity
    pivot: {
        sourceKey: keyof TEntity // pivot table id key, default 'id'
        targetKey: keyof TPivotEntity// pivot table foreign key to current entity
        findEntities(ids: (string | number)[]): Promise<TPivotEntity[]> // function to fetch pivot table rows by related entity ids
    },
    target: {
        sourceKey: keyof TPivotEntity // target entity id key, default 'id'
        targetKey: keyof TTargetEntity // target entity foreign key to pivot table
        findEntities(ids: (string | number)[]): Promise<TTargetEntity[]> // function to fetch related entities by ids
    }
}

export async function loadHasManyThrough<
    TEntity extends Record<string, any> = Record<string, any>,
    TPivotEntity extends Record<string, any> = Record<string, any>,
    TTargetEntity extends Record<string, any> = Record<string, any>
>(payload: any | any[], options: HasManyThroughLoaderOptions<TEntity, TPivotEntity, TTargetEntity>) {
    const entities = Array.isArray(payload) ? payload : [payload]

    const pivoIds = entities.map(e => get(e, options.pivot.sourceKey)).filter(Boolean)
    const pivotEntities = await options.pivot.findEntities(pivoIds)
    const targetIds = pivotEntities.map((p: any) => get(p, options.target.sourceKey)).filter(Boolean)
    const targetEntities = await options.target.findEntities(targetIds)

    for (const entity of entities) {
        const pivots = pivotEntities.filter((p: any) => get(p, options.pivot.targetKey) === get(entity, options.pivot.sourceKey))

        if (!pivots.length) {
            set(entity, options.key, [])
            continue
        }

        const targets = targetEntities
            .filter((t: any) => pivots.some((p: any) => get(p, options.target.targetKey) === get(t, options.target.sourceKey)))

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


