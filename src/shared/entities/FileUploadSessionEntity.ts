import SoftDeleteMixin from '#shared/mixins/SoftDeleteMixin.ts'
import TimestampMixin from '#shared/mixins/TimestampMixin.ts'
import BaseEntityMixin from '#shared/mixins/BaseEntityMixin.ts'
import { compose } from '#shared/utils/compose.ts'

export default class UploadSession extends compose(BaseEntityMixin, TimestampMixin, SoftDeleteMixin) {
    public id: number
    public purpose: string
    public mime_types: string
    public max_size: number

    // dynamic 
    public upload_url?: string
    public create_file_url?: string

    public getParsedMimeTypes(): string[] {
        return this.mime_types.split(',').map(type => type.trim())
    }

    public isAllowedMimeType(mimeType: string): boolean {
        const allowedTypes = this.getParsedMimeTypes()
        return allowedTypes.includes(mimeType) || allowedTypes.includes('*/*')
    }

    public isAllowedSize(size: number): boolean {
        return size <= this.max_size
    }
}
