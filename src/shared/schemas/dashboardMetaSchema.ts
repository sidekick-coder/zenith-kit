import type { ValidatorResult } from '#shared/services/ValidatorService.ts'
import validator from '#shared/facades/validator.ts'


export type DashboardMetaSchema = ValidatorResult<ReturnType<typeof dashboardMetaSchema>>

export function dashboardMetaSchema() {
    return validator.create(v => v.object({
        id: v.number(),
        dashboard_id: v.number(),
        name: v.string(),
        value: v.nullable(v.string()),
    }))
}

dashboardMetaSchema.create = validator.create(v => v.pick(dashboardMetaSchema(), ['dashboard_id', 'name', 'value']))

dashboardMetaSchema.update = validator.create(v => v.partial(dashboardMetaSchema.create))
