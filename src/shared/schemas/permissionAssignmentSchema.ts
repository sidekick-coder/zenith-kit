import * as v from 'valibot'

export type PermissionAssignment = v.InferOutput<typeof permissionAssignmentSchema>

export const permissionAssignmentSchema = v.object({
    id: v.number(),
    permission_id: v.number(),
    assignable_type: v.string(),
    assignable_id: v.string(),
    created_at: v.string(),
    updated_at: v.string(),
})
