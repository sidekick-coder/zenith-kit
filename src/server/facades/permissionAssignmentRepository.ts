import PermissionAssignmentRepository from '#server/repositories/PermissionAssignmentRepository.ts'
import db from '#server/facades/database.ts'

const permissionAssignmentRepository = new PermissionAssignmentRepository(db as any)

export default permissionAssignmentRepository
