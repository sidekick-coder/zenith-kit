import DatabaseRepository from '#server/repositories/DatabaseRepository.ts'
import type { MetadataQueryPayload } from '#server/services/MetadataQueryService.ts'
import MetadataQueryService from '#server/services/MetadataQueryService.ts'
import type FileEntity from '#shared/entities/FileEntity.ts'

export interface FileRepositoryQueryOptions {
    id?: number | number[]
    search?: string
    purpose?: string[]
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

    public query(options?: FileRepositoryQueryOptions) {
        let qb = super.query(options as any)

        if (options?.id) {
            const ids = Array.isArray(options.id) ? options.id : [options.id]

            qb = qb.where('id', 'in', ids)
        }

        if (options?.search) {
            qb = qb.where('f.client_name', 'like', `%${options.search}%`)
        }

        if (options?.purpose?.length) {
            qb = qb.where('f.purpose', 'in', options.purpose)
        }

        if (options?.client_name?.length) {
            qb = qb.where('f.client_name', 'in', options.client_name)
        }

        if (options?.metas) {
            const metasQueryService = new MetadataQueryService(options.metas, 'file_metas', 'file_id')

            qb = metasQueryService.apply(qb)
        }

        return qb
    }
}
