import fs from 'fs'
import path from 'path'
import { load } from 'js-yaml'

interface Options {
    defaultValue?: () => Record<string, any>
}

export async function readAndParse<T extends Record<string, any>>(filePath: string, options?: Options): Promise<T> {
    const defaultValue = options?.defaultValue ? options.defaultValue() : {}

    if (!fs.existsSync(filePath)) {
        return defaultValue as T
    }

    const content = fs.readFileSync(filePath, 'utf-8')

    if (filePath.endsWith('.json')) {
        return JSON.parse(content) as T
    }

    if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
        const parsed = load(content)

        if (typeof parsed === 'object' && parsed !== null) {
            return parsed as T
        }

        return defaultValue as T
    }

    throw new Error(`Unsupported file type for ${filePath}`)
}
