import { BaseException } from '#shared/index.ts'
import type { Loader, LoaderRecord } from './defineLoader.ts'

export function createLoaderFactory<E extends Record<string, any> = Record<string, any>, R extends LoaderRecord<E> = LoaderRecord<E>>(loaders: R) {
    async function load(entities: E | E[], names: keyof R | (keyof R)[]) {
        const items = Array.isArray(entities) ? entities : [entities]
        const relationNames = Array.isArray(names) ? names : [names]

        for (const name of relationNames) {
            const loader = loaders?.[name as string] as Loader

            if (!loader) {
                throw new BaseException(`Loader ${String(name)} not declared`)
            }

            await loader.load(items)
        }

    }

    return {
        keys: Object.keys(loaders) as (keyof R)[],
        loaders,
        load 
    }
}

