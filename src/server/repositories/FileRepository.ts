import DatabaseRepository from '#server/repositories/DatabaseRepository.ts'
import type { MetadataQueryPayload } from '#server/services/MetadataQueryService.ts'
import MetadataQueryService from '#server/services/MetadataQueryService.ts'
import type FileEntity from '#shared/entities/FileEntity.ts'
import { validator } from '#shared/index.ts'

export interface FileRepositoryQueryOptions {
    id?: number | number[]
    search?: string
    purpose?: string[]
    filename?: string | string[]
    client_name?: string[]
    metas?: MetadataQueryPayload
}

export default class FileRepository extends DatabaseRepository<
    FileEntity,
    FileEntity['id'],
    FileRepositoryQueryOptions
> {
    constructor(db: DatabaseRepository['db']) {
        super(db, 'files', 'id')
    }

    public query(payload?: FileRepositoryQueryOptions) {
        let qb = super.query(payload as any)

        const options = validator.validate(payload, v => v.object({
            id: v.optional(v.extras.array(v.number()), []),
            search: v.optional(v.string()),
            purpose: v.optional(v.extras.array(v.string()), []),
            filename: v.optional(v.extras.array(v.string()), []),
            client_name: v.optional(v.extras.array(v.string()), []),
            metas: v.optional(v.any()),
        }))

        if (options.id.length) {
            qb = qb.where('id', 'in', options.id)
        }

        if (options?.search) {
            qb = qb.where('f.client_name', 'like', `%${options.search}%`)
        }

        if (options.purpose.length) {
            qb = qb.where('f.purpose', 'in', options.purpose)
        }

        if (options.client_name.length) {
            qb = qb.where('f.client_name', 'in', options.client_name)
        }

        if (options.filename.length) {
            qb = qb.where('f.filename', 'in', options.filename)
        }

        if (options?.metas) {
            const metasQueryService = new MetadataQueryService(options.metas, 'file_metas', 'file_id')

            qb = metasQueryService.apply(qb)
        }

        return qb
    }
}
