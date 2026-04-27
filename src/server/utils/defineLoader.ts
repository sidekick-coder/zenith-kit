export interface Loader<T = Record<string, any>> {
    load(entities: T[]): Promise<void>
}

export interface LoaderRecord<T = Record<string, any>> {
    [key: string]: Loader<T>
}

export function defineLoader<T = Record<string, any>>(loader: Loader<T>): Loader<T> {
    return loader
}
