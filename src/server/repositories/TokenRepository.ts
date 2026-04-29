import DatabaseRepositoryInfer from '#server/mixins/DatabaseRepositoryInferMixin.ts'
import DatabaseRepository from '#server/repositories/DatabaseRepository.ts'
import { compose, mixin } from '#shared/utils/index.ts'
import type { Token } from '#shared/schemas/tokenSchema.ts'

export interface TokenRepositoryQueryOptions {
    id?: number | number[]
    search?: string 
    type?: string | string[]
}

export default class TokenRepository extends compose(
    mixin(DatabaseRepository),
    DatabaseRepositoryInfer<Token, Token['id'], TokenRepositoryQueryOptions>()
) {

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
}
