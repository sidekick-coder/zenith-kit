import * as v from 'valibot'
import BaseException from '../exceptions/BaseException.ts'

export type Valibot = typeof v

export type ValibotSchema = v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
export type ValibotSchemaAsync = v.BaseSchemaAsync<unknown, unknown, v.BaseIssue<unknown>>

export interface ValidatorCallback<T extends ValibotSchema> {
    (_v: typeof v): T
}

export type ValidatorCallbackAsync<T extends ValibotSchemaAsync> = {
    (_v: typeof v): T
}

export type ValidatorResult<T extends v.ObjectEntries> = v.InferOutput<v.ObjectSchema<T, undefined>>

export type ValidatePayload<T extends ValibotSchema = ValibotSchema> = ValidatorCallback<T> | T

export type ValidateResult<T extends ValidatePayload> =
    T extends ValibotSchema ? v.InferOutput<T> :
    T extends ValidatorCallback<infer U> ? v.InferOutput<U> :
    unknown

export class ValidatorService {
    public create<T extends ValibotSchema>(cb: ValidatorCallback<T>) {
        return cb(v)
    }

    public validate<T extends ValibotSchema>(payload: any, cb: ValidatePayload<T>) {
        const schema: T = typeof cb === 'function' ? cb(v) : cb
        
        const { output, issues, success } = v.safeParse(schema, payload)
        
        if (!success) {
            const flatten = v.flatten(issues)
            const messages = [] as string[]
        
            if (flatten.root) {
                messages.push(...flatten.root)
            }
        
            if (flatten.nested) {
                Object.entries(flatten.nested).forEach((entry) => {
                    const [key, value] = entry as [string, string[]]
        
                    messages.push(...value.map((v) => `${key}: ${v}`))
                })
            }
        
            const message = messages.length ? messages.join(', ') : 'Validation failed'
        
            const error = new BaseException(message, 422)
        
            error.name = 'ValidationError'
        
            Object.assign(error, { messages, })
        
            throw error
        }
        
        return output
    }

    public async validateAsync<T extends ValibotSchemaAsync>(payload: any, cb: ValidatorCallbackAsync<T> | T) {
        const schema: T = typeof cb === 'function' ? cb(v) : cb

        const { output, issues, success } = await v.safeParseAsync(schema, payload)

        if (!success) {
            const error = new Error('Validation failed')
            const flatten = v.flatten(issues)
            const details = {
                ...flatten.root,
                ...flatten.nested,
            }

            Object.assign(error, { details, })

            throw error
        }

        return output
    }

    public isValid<T extends ValibotSchema>(payload: any, cb: ValidatePayload<T>): boolean {
        const schema: T = typeof cb === 'function' ? cb(v) : cb

        const { success } = v.safeParse(schema, payload)

        return success
    }
}

const validator = new ValidatorService()

export default validator
