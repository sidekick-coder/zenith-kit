import type { Token } from '#shared/schemas/tokenSchema.ts'
import type UserEntity from '#shared/entities/UserEntity.ts'
import type { Middleware, } from '#server/contracts/RouterContract.ts'
import BaseException from '#shared/exceptions/BaseException.ts'

export type AuthMiddlewareContext = {
    user: UserEntity
    token: Token
}

export default class AuthMiddleware implements Middleware {
    public async handle(ctx: any): Promise<AuthMiddlewareContext> {
        if (!ctx.user || !ctx.token) {
            throw new BaseException('Invalid authentication token', 401)
        }

        return {
            user: ctx.user!,
            token: ctx.token!,
        }
    }
}

