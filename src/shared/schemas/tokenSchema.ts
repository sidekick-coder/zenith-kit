import * as v from 'valibot'

export type Token = v.InferOutput<typeof tokenSchema>

export const tokenSchema = v.object({
    id: v.number(),
    name: v.nullable(v.string()),
    type: v.string(),
    user_id: v.number(),
    token: v.string(),
    created_at: v.string(),
    updated_at: v.string(),
    expires_at: v.string(),
})
