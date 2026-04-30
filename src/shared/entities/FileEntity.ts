import SoftDeleteMixin from '#shared/mixins/SoftDeleteMixin.ts'
import TimestampMixin from '#shared/mixins/TimestampMixin.ts'
import BaseEntityMixin from '#shared/mixins/BaseEntityMixin.ts'
import { compose } from '#shared/utils/compose.ts'

export default class FileEntity extends compose(BaseEntityMixin, TimestampMixin, SoftDeleteMixin) {  
    public id: number
    public drive: string
    public mimetype: string
    public purpose: string
    public client_name: string
    public filename: string
    public public: boolean

    // dynamic
    public url?: string
    public metas?: Record<string, any>

    public isImage(): boolean {
        return this.mimetype.startsWith('image/')
    }
}
