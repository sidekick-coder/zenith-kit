import * as  datetime from './datetime.ts'
import * as json from './json.ts'
import * as boolean from './boolean.ts'

export function toDb(payload: Record<string, any>) {

    const result = { ...payload }

    for (const key in result) {
        if (result[key] instanceof Date) {
            result[key] = datetime.toDb(result[key])
        }

        if (typeof result[key] === 'object') {
            result[key] = json.toDb(result[key])
        }

        if (typeof result[key] === 'boolean') {
            result[key] = boolean.toDb(result[key])
        }

        if (Array.isArray(result[key])) {
            result[key] = json.toDb(result[key])
        }
    }

    return result
}

export function fromDb(value: Record<string, any>) {
    const result = { ...value }

    for (const key in result) {
        result[key] = parseValue(result[key])
    }

    return result
}
