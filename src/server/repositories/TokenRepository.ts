import DatabaseRepositoryInfer from '#server/mixins/DatabaseRepositoryInferMixin.ts'
import DatabaseRepository from '#server/repositories/DatabaseRepository.ts'
import { compose, mixin } from '#shared/utils/index.ts'
import type { Token } from '#shared/schemas/tokenSchema.ts'

export interface QueryOptions {
    id?: number | number[]
    search?: string 
    type?: string | string[]
}

export default class TokenRepository extends compose(
    mixin(DatabaseRepository),
    DatabaseRepositoryInfer<Token, Token['id'], QueryOptions>()
) {
    public query(options?: QueryOptions) {
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
}
