import PermissionRepository from '#server/repositories/PermissionRepository.ts'
import db from '#server/facades/database.ts'

const permissionRepository = new PermissionRepository(db as any)

export default permissionRepository
