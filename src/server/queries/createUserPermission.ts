import { findOne } from './findOne.ts'
import { create } from './create.ts'
import { firstOrCreate } from './firstOrCreate.ts'
import Permission from '#shared/entities/permission.entity.ts'

export async function createUserPermission(userId: number, payload: Partial<Permission>) {
    if (!payload.name) {
        payload.name =  `user:${userId}:${payload.action}:${payload.subject}`.toLowerCase()
    }

    const permission = await firstOrCreate('permissions', {
        select: (qb) => qb.selectAll().where('name', '=', payload.name!),
        values: {
            name: payload.name,
            description: payload.description,
            origin: payload.origin!,
            action: payload.action!,
            subject: payload.subject!,
            conditions: payload.conditions ? JSON.stringify(payload.conditions) : undefined
        }
    })

    let assignment = await findOne('permissions_assignments', {
        where: (eb) => eb.and({
            permission_id: permission.id,
            assignable_type: 'user',
            assignable_id: userId.toString()
        })
    })

    if (!assignment) {
        assignment = await create('permissions_assignments', {
            values: {
                permission_id: permission.id,
                assignable_type: 'user',
                assignable_id: userId.toString()
            }
        })
    }

    return {
        permission,
        assignment 
    }
}