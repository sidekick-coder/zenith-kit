import BaseEntity from '#shared/mixins/BaseEntityMixin.ts'
import SoftDeleteMixin from '#shared/mixins/SoftDeleteMixin.ts'
import TimestampMixin from '#shared/mixins/TimestampMixin.ts'
import { compose } from '#shared/utils/compose.ts'

export default class Role extends compose(BaseEntity, TimestampMixin, SoftDeleteMixin) {
    public id: number
    public name: string
    public description?: string
}
