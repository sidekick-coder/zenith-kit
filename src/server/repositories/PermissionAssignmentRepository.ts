import DatabaseRepositoryInfer from '#server/mixins/DatabaseRepositoryInferMixin.ts'
import DatabaseRepository from '#server/repositories/DatabaseRepository.ts'
import type { PermissionAssignment } from '#shared/schemas/permissionAssignmentSchema.ts'
import { compose, mixin } from '#shared/utils/index.ts'

interface QueryOptions {
    id?: number | number[]
    permissionId?: number | number[]
    assignableId?: number | number[]
    assignableType?: string | string[]
}

export default class PermissionAssignmentRepository extends compose(
    mixin(DatabaseRepository),
    DatabaseRepositoryInfer<PermissionAssignment, PermissionAssignment['id']>()
) {

    public query(options?: QueryOptions) {
        let qb = super.query(options as any)

        if (options?.id) {
            const ids = Array.isArray(options.id) ? options.id : [options.id]

            qb = qb.where('id', 'in', ids)
        }

        if (options?.permissionId) {
            const permissionIds = Array.isArray(options.permissionId) ? options.permissionId : [options.permissionId]

            qb = qb.where('permission_id', 'in', permissionIds)
        }

        if (options?.assignableId) {
            const assignableIds = Array.isArray(options.assignableId) ? options.assignableId : [options.assignableId]

            qb = qb.where('assignable_id', 'in', assignableIds)
        }

        if (options?.assignableType) {
            const assignableTypes = Array.isArray(options.assignableType) ? options.assignableType : [options.assignableType]

            qb = qb.where('assignable_type', 'in', assignableTypes)
        }

        return qb
    }

    constructor(db: DatabaseRepository['db']) {
        super(db, 'permissions_assignments', 'id')
    }
}
