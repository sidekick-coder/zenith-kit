import path from 'path'

export function basePath(...args: string[]): string {
    const BASE_PATH = process.env.ZENITH_BASE_PATH!

    if (!BASE_PATH) {
        throw new Error('ZENITH_BASE_PATH environment variable is not set')
    }

    return path.resolve(BASE_PATH, ...args)
}

export function serverPath(...args: string[]): string {
    if (process.env.NODE_ENV === 'production') {
        return basePath('dist', 'server', ...args)
    }

    return basePath('src', 'server', ...args)
}

export function clientPath(...args: string[]): string {
    if (process.env.NODE_ENV === 'production') {
        return basePath('dist', 'client-browser', ...args)
    }

    return basePath('src', 'client', ...args)
}

export function storagePath(...args: string[]): string {
    const BASE_PATH = process.env.ZENITH_BASE_PATH!
    const STORAGE_PATH = process.env.ZENITH_STORAGE_PATH || path.join(BASE_PATH || '', 'storage')

    return path.resolve(STORAGE_PATH, ...args)
}

export function relativeToBasePath(...args: string[]): string {
    const BASE_PATH = process.env.ZENITH_BASE_PATH!

    if (!BASE_PATH) {
        throw new Error('ZENITH_BASE_PATH environment variable is not set')
    }

    return path.relative(process.cwd(), path.resolve(BASE_PATH, ...args))
}

export function tmpPath(...args: string[]): string {
    return basePath('tmp', ...args)
}
