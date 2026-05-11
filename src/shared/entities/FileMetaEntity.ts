import { compose } from '#shared/utils/compose.ts'
import BaseEntityMixin from '#shared/mixins/BaseEntityMixin.ts'
import TimestampMixin from '#shared/mixins/TimestampMixin.ts'
import SoftDeleteMixin from '#shared/mixins/SoftDeleteMixin.ts'

export default class FileMeta extends compose(BaseEntityMixin, TimestampMixin, SoftDeleteMixin) {  
    public id: number
    public file_id: number
    public name: string
    public value: string | null
}
