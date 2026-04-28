import path from 'path'

const BASE_PATH = process.env.ZENITH_BASE_PATH

export function basePath(...args: string[]): string {
    if (!BASE_PATH) {
        throw new Error('ZENITH_BASE_PATH environment variable is not set')
    }

    return path.resolve(BASE_PATH, ...args)
}

export function tmpPath(...args: string[]): string {
    return basePath('tmp', ...args)
}
