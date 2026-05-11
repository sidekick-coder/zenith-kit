import type { AuthSilenceMiddlewareContext } from './AuthSilenceMiddleware.ts'
import type {
    Middleware, 
    MiddlewareHandleResult 
} from '#server/contracts/RouterContract.ts'

import Acl from '#server/entities/AclEntity.ts'
import Permission from '#shared/entities/PermissionEntity.ts'
import config from '#server/facades/config.ts'
import logger from '#server/facades/logger.ts'
import permissionRepository from '#server/facades/permissionRepository.ts'
import permissionAssignmentRepository from '#server/facades/permissionAssignmentRepository.ts'

export type AuthorizationContext = MiddlewareHandleResult<[AuthorizationMiddleware]>

export interface AuthorizePermissionPayload {
    action: string
    resource: string
    conditions?: Record<string, any>
}

export class AuthorizePermission implements Middleware {
    private permissions: AuthorizePermissionPayload[]

    constructor(payload: AuthorizePermissionPayload | AuthorizePermissionPayload[]) {
        this.permissions = Array.isArray(payload) ? payload : [payload]
    }

    public async handle(ctx: AuthorizationContext) {
        for (const p of this.permissions) {
            ctx.acl.authorize(
                p.action,
                p.resource,
                p.conditions || {},
            )
        }
    }
}

export default class AuthorizationMiddleware implements Middleware {
    public async handle(ctx: AuthSilenceMiddlewareContext){
        const token = ctx.token
        let currentPermissions: Permission[] = []
        const permissionContext = {} as Record<string, any>

        // if auth token load permissions for user
        if (ctx.user && token?.type === 'auth') {
            const assignments = await permissionAssignmentRepository.findMany({
                assignableId: String(ctx.user.id),
                assignableType: 'user'
            })

            currentPermissions = await permissionRepository.findMany({ id: assignments.map(a => a.permission_id) })

            permissionContext.auth = {
                user: {
                    id: ctx.user.id,
                    name: ctx.user.name,
                    email: ctx.user.email,
                },
            }
        }

        if (token && token.type === 'api') {
            const assignments = await permissionAssignmentRepository.findMany({
                assignableId: String(token.id),
                assignableType: 'token'
            })

            currentPermissions = await permissionRepository.findMany({ id: assignments.map(a => a.permission_id) })

            permissionContext.api = {
                token: {
                    id: token.id,
                    name: token.name,
                },
            }
        }

        const permissions = Permission.applyContext(currentPermissions, permissionContext)

        const acl = new Acl({
            permissions,
            debug: config.get('acl.debug') || config.get('app.debug'),
            logger: logger.child({ label: 'acl' }),
        })
        
        return { acl }
    }

    public static create(payload: AuthorizePermissionPayload | AuthorizePermissionPayload[]) {
        return new AuthorizePermission(payload)
    }
}
