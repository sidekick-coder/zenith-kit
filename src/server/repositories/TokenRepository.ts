import DatabaseRepositoryInfer from '#server/mixins/DatabaseRepositoryInferMixin.ts'
import DatabaseRepository from '#server/repositories/DatabaseRepository.ts'
import { compose, mixin } from '#shared/utils/index.ts'
import type { Token } from '#shared/schemas/tokenSchema.ts'
import { randomBytes } from 'crypto'

export interface TokenRepositoryQueryOptions {
    id?: number | number[]
    search?: string
    type?: string | string[]
}

export interface TokenRepositoryGenerateOptions {
    user_id: number
    type?: string
    expires_in_hours?: number
}

export default class TokenRepository extends compose(
    mixin(DatabaseRepository),
    DatabaseRepositoryInfer<Token, Token['id'], TokenRepositoryQueryOptions>()
) {
    public autoCreatedAt: boolean = true
    public autoUpdatedAt: boolean = false

    constructor(db: DatabaseRepository['db']) {
        super(db, 'tokens', 'id')
    }

    public query(options?: TokenRepositoryQueryOptions) {
        let qb = super.query(options as any)

        if (options?.id) {
            const ids = Array.isArray(options.id) ? options.id : [options.id]

            qb = qb.where('id', 'in', ids)
        }

        if (options?.search) {
            qb = qb.where('name', 'like', `%${options.search}%`)
        }

        if (options?.type) {
            const types = Array.isArray(options.type) ? options.type : [options.type]

            qb = qb.where('type', 'in', types)
        }

        return qb
    }

    public async findByToken(token: string): Promise<Token | null> {
        let qb = this.query() as any

        qb = qb.selectAll()

        qb = qb.where('token', '=', token)

        const item = await qb.executeTakeFirst()

        return item || null
    }

    public async findActiveToken(value: string): Promise<Token | null> {
        const token = await this.findByToken(value)

        if (!token) {
            return null
        }

        if (token.expires_at && new Date(token.expires_at) < new Date()) {
            return null
        }

        return token
    }

    async isTokenValid(tokenValue: string): Promise<boolean> {
        const token = await this.findByToken(tokenValue)

        if (!token) {
            return false
        }

        if (token.expires_at && new Date(token.expires_at) < new Date()) {
            return false
        }

        return true
    }

    async generate(options: TokenRepositoryGenerateOptions) {
        const token = randomBytes(64).toString('hex')

        let expiresAt: string | null = null

        if (options.expires_in_hours) {
            expiresAt = new Date(Date.now() + options.expires_in_hours * 60 * 60 * 1000).toISOString()
        }

        return await this.create({
            user_id: options.user_id,
            token,
            type: options.type || 'auth',
            expires_at: expiresAt
        })
    }

    async revoke(tokenValue: string): Promise<boolean> {
        const token = await this.findByToken(tokenValue)

        if (!token) {
            return false
        }

        await this.deleteById(token.id)

        return true
    }
}
