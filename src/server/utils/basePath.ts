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

export function dataPath(...args: string[]): string {
    const DATA_PATH = process.env.ZENITH_DATA_PATH || path.join(process.env.ZENITH_BASE_PATH || '', 'data')

    return path.resolve(DATA_PATH, ...args)
}

export function storagePath(...args: string[]): string {
    return dataPath('storage', ...args)
}

export function tmpPath(...args: string[]): string {
    return dataPath('tmp', ...args)
}

export function relativeToBasePath(...args: string[]): string {
    const BASE_PATH = process.env.ZENITH_BASE_PATH!

    if (!BASE_PATH) {
        throw new Error('ZENITH_BASE_PATH environment variable is not set')
    }

    return path.relative(process.cwd(), path.resolve(BASE_PATH, ...args))
}
