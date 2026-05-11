import type { UserTable } from '#server/contracts/DatabaseContract.ts'
import DatabaseRepository from './DatabaseRepository'

export interface UserRepositoryQueryOptions {
    email?: string
    username?: string
    id?: number
}

export default class UserRepository extends DatabaseRepository<UserTable, string, UserRepositoryQueryOptions> {
    constructor(db: DatabaseRepository['db']) {
        super(db, 'users', 'id')
    }

    public query(options: UserRepositoryQueryOptions = {}) {
        let query = super.query(options)

        query = query.where('deleted_at', 'is', null)

        // Apply options
        if (options?.email) {
            query = query.where('email', '=', options.email)
        }

        if (options?.username) {
            query = query.where('username', 'like', `%${options.username}%`)
        }

        if (options?.id) {
            query = query.where('id', '=', options.id)
        }

        return query
    }
}
