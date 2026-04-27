import { format } from 'date-fns'
import { get, set } from 'lodash-es'
import * as v from 'valibot'
import qs from 'qs'

export const number = () => v.pipe(
    v.union([v.string(), v.number()]),
    v.transform(Number),
    v.integer(),
)

export const boolean = () => v.pipe(
    v.union([v.string(), v.boolean()]),
    v.transform(v => v === true || v === 'true'),
)

export const date = () => v.pipe(
    v.union([v.string(), v.date()]),
    v.transform(v => v instanceof Date ? v : new Date(v)),
    v.transform(v => v ? format(v, 'yyyy-MM-dd') : v),
)

export const datetime = () => v.pipe(
    v.union([v.string(), v.date()]),
    v.transform(v => {
        if (!v) return v

        if (v === 'null') return null

        if (typeof v === 'string') {
            v = new Date(v)
        }

        return format(v, 'yyyy-MM-dd HH:mm')
    }),
)

export const array = <T extends v.BaseSchema<any, any, any>>(schema: T = v.any() as any as T) => v.pipe(
    v.union([v.string(), v.array(v.string())]),
    v.transform(value => Array.isArray(value) ? value : value.split(',')),
    v.array(schema),
)

export const arrayNumber = () => v.pipe(
    array(),
    v.transform(value => value.map(Number)),
)

export const object = () => v.pipe(
    v.union([v.string(), v.record(v.string(), v.any())]),
    v.transform(value => typeof value === 'string' ? qs.parse(value) : value),
    v.transform(value => {
        const result: Record<string, any> = {}

        for (const key in value) {
            set(result, key, get(value, key))
        }

        return result
    }),
)

