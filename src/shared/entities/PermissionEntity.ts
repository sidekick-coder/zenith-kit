import BaseEntity from '#shared/mixins/BaseEntityMixin.ts'
import { compose } from '#shared/utils/compose.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

export default class PermissionEntity extends compose(BaseEntity) {
    public id: number
    public name: string
    public description: string | null = null
    public origin: string
    public subject: string
    public action: string
    public conditions: string | null | Record<string, any> = null

    public get editable() {
        return this.origin === 'custom'
    }

    public get parsedConditions() {
        if (!this.conditions) {
            return {}
        }

        const [error, json] = tryCatch.sync(() => {
            if (typeof this.conditions === 'string') {
                return JSON.parse(this.conditions as string)
            }
            
            return this.conditions as Record<string, any>
        })

        return error ? {} : json
    }
}
