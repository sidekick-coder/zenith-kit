import DatabaseRepositoryInfer from '#server/mixins/DatabaseRepositoryInferMixin.ts'
import DatabaseRepository from '#server/repositories/DatabaseRepository.ts'
import type { PermissionAssignment } from '#shared/schemas/permissionAssignmentSchema.ts'
import { compose, mixin } from '#shared/utils/index.ts'

export default class PermissionAssignmentRepository extends compose(
    mixin(DatabaseRepository),
    DatabaseRepositoryInfer<PermissionAssignment, PermissionAssignment['id']>()
) {

    constructor(db: DatabaseRepository['db']) {
        super(db, 'permissions_assignments', 'id')
    }
}
