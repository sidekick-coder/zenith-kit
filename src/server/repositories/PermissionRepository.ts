import DatabaseRepositoryInfer from '#server/mixins/DatabaseRepositoryInferMixin.ts'
import DatabaseRepository from '#server/repositories/DatabaseRepository.ts'
import { compose, mixin } from '#shared/utils/index.ts'
import type { Permission } from '#shared/schemas/permissionSchema.ts'

export interface QueryOptions {
    id?: number | number[]
    search?: string 
}

export default class PermissionRepository extends compose(
    mixin(DatabaseRepository),
    DatabaseRepositoryInfer<Permission, Permission['id'], QueryOptions>()
) {

    constructor(db: DatabaseRepository['db']) {
        super(db, 'permissions', 'id')
    }

    public query(options?: QueryOptions) {
        let qb = super.query(options as any)

        if (options?.id) {
            const ids = Array.isArray(options.id) ? options.id : [options.id]

            qb = qb.where('id', 'in', ids)
        }

        if (options?.search) {
            qb = qb.where('name', 'like', `%${options.search}%`)
        }

        return qb
    }
}
