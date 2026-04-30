import { test, expectTypeOf, describe } from 'vitest'
import PermissionRepository from './PermissionRepository'
import type { Permission } from '#shared/schemas/permissionSchema.ts'

describe('PermissionRepository', () => {
    const repository = {} as any as PermissionRepository

    test('should findMany return permissions array', () => {
        expectTypeOf(repository.findMany()).resolves.toEqualTypeOf<Permission[]>()
    })

    test('should findById return a permission or null', () => {
        expectTypeOf(repository.findById(1)).resolves.toEqualTypeOf<Permission | null>()
    })

    test('should findByIdOrFail return a permission', () => {
        expectTypeOf(repository.findByIdOrFail(1)).resolves.toEqualTypeOf<Permission>()
    })
})

