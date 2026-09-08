
import * as v from 'valibot'

export function array<T extends v.BaseSchema<any, any, any>>(schema: T = v.any() as any as T) {
    return v.pipe(
        v.union([schema, v.array(schema)]),
        v.transform(value => Array.isArray(value) ? value : [value]),
        v.array(schema),
    )
}

array.number = () => array(v.number())

