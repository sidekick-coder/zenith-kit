import * as v from 'valibot' 
import { set } from 'lodash-es'

export const keyValue = () => v.pipe(v.string(), v.transform((value) => {
    const entries = value.split(/[;\n]/)
        .filter(Boolean)
        .filter(l => l.includes('='))
        .map(l => l.trim().split('='))

    const obj = Object.fromEntries(entries) as Record<string, string>

    const result: Record<string, any> = {}

    for (const [key, value] of Object.entries(obj)) {
        let parsedValue: any = value

        if (value.startsWith('bool:')) {
            parsedValue = value.replace('bool:', '').trim() === 'true'
        }

        set(result, key, parsedValue)
    }

    return result
}))
