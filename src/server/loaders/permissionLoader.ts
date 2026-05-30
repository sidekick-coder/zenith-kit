import type { Permission } from '@sidekick-coder/zenith-kit/shared'
import { set } from 'lodash-es'
import permissionAssignmentRepository from '#server/facades/permissionAssignmentRepository.ts'
import permissionRepository from '#server/facades/permissionRepository.ts'
import { defineLoader } from '#server/utils/defineLoader.ts'

interface PermissionLoaderOptions {
    assignableType: string | ((e: any) => string)
    assignableId: string | ((e: any) => string)
    targetKey?: string
}

export async function loadPermissions<T extends Record<string, any>>(payload: T | T[], options?: PermissionLoaderOptions) {
    const entities = Array.isArray(payload) ? payload : [payload]

    const targetKey = options?.targetKey || 'permissions'
    const assignTypeFn = typeof options?.assignableType === 'function' ? options.assignableType : () => options?.assignableType as string
    const assignableIdFn = typeof options?.assignableId === 'function' ? options.assignableId : () => options?.assignableId as string

    const assignTypes = new Set<string>()
    const assignableIds = new Set<string>()

    for (const entity of entities) {
        const assignableType = assignTypeFn(entity)
        const assignableId = assignableIdFn(entity)

        if (assignableType && assignableId) {
            assignTypes.add(assignableType)
            assignableIds.add(assignableId)
        }
    }


    const assignments = await permissionAssignmentRepository.findMany({
        assignableId: Array.from(assignableIds.values()),
        assignableType: Array.from(assignTypes.values()),
    })

    const permissionIds = Array.from(new Set(assignments.map(a => a.permission_id)))
    const permissions = await permissionRepository.findMany({ id: permissionIds })

    for (const entity of entities) {
        const assignableType = assignTypeFn(entity)
        const assignableId = assignableIdFn(entity)

        if (!assignableType || !assignableId) {
            continue
        }

        const entityAssignments = assignments.filter(a => a.assignable_type === assignableType && a.assignable_id === assignableId)
        const entityPermissions = entityAssignments.map(a => permissions.find(p => p.id === a.permission_id)).filter(Boolean) as Permission[]

        set(entity, targetKey, entityPermissions)
    }
}

export function createPermissionLoader<T extends Record<string, any>>(options?: PermissionLoaderOptions) {
    return defineLoader<T>({ load: (entities) => loadPermissions(entities, options), })
}

