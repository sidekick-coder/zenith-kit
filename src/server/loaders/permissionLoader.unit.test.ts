import { createTestDb } from '#server/__tests__/helpers/createTestDB.ts'
import permissionAssignmentRepository from '#server/facades/permissionAssignmentRepository.ts'
import permissionRepository from '#server/facades/permissionRepository.ts'
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it
} from 'vitest'
import { loadPermissions } from './permissionLoader'
import { createUser } from '#server/__tests__/helpers/createUser.ts'

describe('permissionLoader', () => {
    const db = createTestDb()
    
    beforeAll(() => db.setup())
    afterAll(() => db.teardown())

    it('should load permissions for a user', async () => {
        const user = await createUser()

        const permissions = await permissionRepository.createMany([
            { name: 'permission 1', subject: 'user', action: 'read'  },
            { name: 'permission 2', subject: 'user', action: 'write'  },
            { name: 'permission 3', subject: 'post', action: 'read'  },
        ])

        await permissionAssignmentRepository.createMany(permissions.map(permission => ({
            assignable_id: String(user.id),
            assignable_type: 'user',
            permission_id: permission.id
        })))

        await loadPermissions(user, {
            assignableId: String(user.id),
            assignableType: 'user',
        })

        expect(user.permissions?.length).toBe(3)
    })
})

