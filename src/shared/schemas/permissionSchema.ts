import * as v from 'valibot'

export type Permission = v.InferOutput<typeof permissionSchema>

export const permissionSchema = v.object({
    id: v.number(),
    name: v.nullable(v.string()),
    description: v.nullable(v.string()),
    action: v.string(),
    subject: v.string(),
    conditions: v.nullable(v.string()),
    created_at: v.string(),
    updated_at: v.string(),
    expires_at: v.string(),
})
