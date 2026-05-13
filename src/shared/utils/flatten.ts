import { set } from 'lodash-es'

export function flatten(obj: any, prefix = '', res: any = {}): Record<string, any> {
    for (const [key, value] of Object.entries(obj)) {
        const isIndex = /^\d+$/.test(key)
        const newKey = isIndex ? `${prefix}[${key}]` : prefix ? `${prefix}.${key}` : key

        if (value && typeof value === 'object') {
            flatten(value, newKey, res)
            continue
        }

        res[newKey] = value
    }

    return res
}

export function unflatten(obj: any): Record<string, any> {
    const result = {}
    for (const [key, value] of Object.entries(obj)) {
        set(result, key, value)
    }
    return result
}
