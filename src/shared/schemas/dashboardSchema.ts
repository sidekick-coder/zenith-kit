import type { ValidatorResult } from '#shared/services/ValidatorService.ts'
import validator from '#shared/facades/validator.ts'

export type DashboardSchema = ValidatorResult<ReturnType<typeof dashboardSchema>>

export function dashboardSchema() {
    return validator.create(v => v.object({
        id: v.number(),
        name: v.string(),
        description: v.nullable(v.string()),
        created_at: v.string(),
        updated_at: v.string(),
        deleted_at: v.nullable(v.string()),

        metas: v.optional(v.record(v.string(), v.any())),
    }))
}

dashboardSchema.create = validator.create(v => v.pick(dashboardSchema(), ['name', 'description']))

dashboardSchema.update = validator.create(v => v.partial(dashboardSchema.create))
