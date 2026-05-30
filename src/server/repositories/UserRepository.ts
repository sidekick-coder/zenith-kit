import emmitter from '#server/facades/emmitter.ts'
import hasher from '#server/facades/hasher.ts'
import type { UserEntity } from '#shared/index.ts'
import DatabaseRepository from './DatabaseRepository'

export interface UserRepositoryQueryOptions {
    id?: number | number[]
    search?: string
    email?: string
    username?: string
    showDeleted?: boolean
}

export interface UserRepositoryEvents {
    'user:created': {
        user: UserEntity
    }
    'user:updated': {
        user: UserEntity
    }
    'user:deleted': {
        user: UserEntity
    }
}

export default class UserRepository extends DatabaseRepository<UserEntity, number, UserRepositoryQueryOptions> {
    constructor(db: DatabaseRepository['db']) {
        super(db, 'users', 'id')
    }

    public async hashUserPasswordIfDefined(data: Partial<UserEntity>) {
        if (data.password) {
            data.password = await hasher.hash(data.password)
        }
    }

    protected async beforeCreate(data: Partial<UserEntity>) {
        await this.hashUserPasswordIfDefined(data)

        return data
    }

    protected async beforeCreateMany(data: Partial<UserEntity>[]): Promise<Partial<UserEntity>[]> {
        for (const item of data) {
            await this.hashUserPasswordIfDefined(item)
        }

        return data
    }

    protected async beforeUpdate(data: Partial<UserEntity>) {
        await this.hashUserPasswordIfDefined(data)

        return data
    }

    protected async afterCreate(data: UserEntity): Promise<void> {
        emmitter.emit('user:created', {
            user: data
        })
    }

    public query(options: UserRepositoryQueryOptions = {}) {
        let query = super.query(options)

        if (!options.showDeleted) {
            query = query.where('deleted_at', 'is', null)
        }

        if (options.search) {
            query = query.where((eb: any) => eb.or([
                eb('name', 'like', `%${options.search}%`),
                eb('username', 'like', `%${options.search}%`),
                eb('email', 'like', `%${options.search}%`),
            ]))
        }

        // Apply options
        if (options?.email) {
            query = query.where('email', '=', options.email)
        }

        if (options?.username) {
            query = query.where('username', 'like', `%${options.username}%`)
        }

        if (options?.id) {
            const ids = Array.isArray(options.id) ? options.id : [options.id]

            query = query.where('id', 'in', ids)
        }

        return query
    }
}
