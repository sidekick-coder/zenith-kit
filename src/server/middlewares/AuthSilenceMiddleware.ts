import type { Token } from '@sidekick-coder/zenith-kit/shared'
import type { Middleware, } from '#server/contracts/RouterContract.ts'
import type User from '#shared/entities/UserEntity.ts'
import tokenRepository from '#server/facades/tokenRepository.ts'
import userRepository from '#server/facades/userRepository.ts'
import type { HttpContext } from '#server/contracts/HttpContextContract.ts'

export type AuthSilenceMiddlewareContext = {
    user?: User
    token?: Token
}

export default class AuthSilenceMiddleware implements Middleware {
    public async handle(ctx: HttpContext): Promise<AuthSilenceMiddlewareContext> {
        // Example authentication logic
        let token = ctx.cookie.get('Authorization')

        if (ctx.request && ctx.request.headers['authorization']) {
            token = ctx.request.headers['authorization']
        }

        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7) // Remove 'Bearer ' prefix
        }

        if (!token) {
            return { 
                user: undefined,
                token: undefined,
            }
        }

        const tokenRow = await tokenRepository.findByToken(token)
        let user: User | undefined = undefined

        if (tokenRow) {
            user = await userRepository.findOrFail(tokenRow.user_id)
        }

        return { 
            user,
            token: tokenRow || undefined,
        }
    }
}
