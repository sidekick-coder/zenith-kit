import type { Kysely } from 'kysely'
import BaseException from '#shared/exceptions/BaseException.ts'

export interface Pagination<T = any> {
    items: T[]
    page: number
    per_page: number
    total: number
    total_pages: number
}

export interface FindManyOptions {
    limit?: number
    offset?: number
    orderBy?: string | string[]
    orderDirection?: 'asc' | 'desc' | ('asc' | 'desc')[]
}

export interface PaginateOptions {
    page?: number
    limit?: number
    orderBy?: FindManyOptions['orderBy']
    orderDirection?: FindManyOptions['orderDirection']
}

export interface DeleteManyOptions {
    limit?: number
}

export default class DatabaseRepository {
    protected db: Kysely<any> = null as any
    protected table: string = ''
    protected primaryKey: string = 'id'

    constructor(db: Kysely<any>, table: string, primaryKey: string) {
        if (db) {
            this.db = db
        }

        if (table) {
            this.table = table
        }

        if (primaryKey) {
            this.primaryKey = primaryKey
        }
    }

    public setDatabase(db: Kysely<any>) {
        this.db = db
        return this
    }

    public setTable(table: string) {
        this.table = table
        return this
    }

    public setPrimaryKey(primaryKey: string) {
        this.primaryKey = primaryKey
        return this
    }

    public query(options?: { qb?: any } & Record<string, any>) {
        return (options?.qb || this.db.selectFrom(this.table as any)) as any
    }

    async count(options?: Record<string, any>) {
        let qb = this.query(options as any) as any

        qb = qb.select((eb: any) => eb.fn.countAll().as('count'))

        const result = await qb.executeTakeFirstOrThrow()

        return Number(result.count)
    }

    async findMany(options?: FindManyOptions & Record<string, any>) {
        let qb = this.query(options) as any

        qb = qb.selectAll()

        if (options?.limit) {
            qb = qb.limit(options.limit)
        }

        if (options?.offset) {
            qb = qb.offset(options.offset)
        }

        if (options?.orderBy) {
            const orderBy = Array.isArray(options.orderBy) ? options.orderBy : [options.orderBy]
            const orderDirection = Array.isArray(options.orderDirection) ? options.orderDirection : [options.orderDirection ?? 'asc']

            orderBy.forEach((ob, index) => {
                qb = qb.orderBy(ob, orderDirection[index] || 'asc')
            })
        }

        return await qb.execute()
    }

    async findById(id: any, options?: Record<string, any>) {
        let qb = this.query(options as any) as any

        qb = qb.selectAll()

        qb = qb.where(this.primaryKey, '=', id)

        const item = await qb.executeTakeFirst()

        return item
    }

    async findByIdOrFail(id: any, options?: Record<string, any>) {
        const item = await this.findById(id, options)

        if (!item) {
            throw new BaseException('Item not found', 404)
        }

        return item
    }

    public async paginate(options?: PaginateOptions & Record<string, any>) {
        const page = options?.page ?? 1
        const offset = (page - 1) * (options?.limit ?? 10)
        const limit = options?.limit ?? 10

        const findAllOptions = {
            ...options,
            limit,
            offset
        }

        const countOptions = { ...options }

        const [items, totalItems] = await Promise.all([
            this.findMany(findAllOptions as FindManyOptions & Record<string, any>),
            this.count(countOptions as Record<string, any>)
        ])

        return {
            items,
            page,
            per_page: limit,
            total: totalItems,
            total_pages: Math.ceil(totalItems / limit)
        } as Pagination
    }

    public async create(data: any) {
        let qb = this.db.insertInto(this.table as any) as any

        qb = qb.values(data).returningAll()

        const result = await qb.executeTakeFirst()

        return result as any
    }

    public async createMany(data: any[]) {
        let qb = this.db.insertInto(this.table as any) as any

        qb = qb.values(data).returningAll()

        const result = await qb.execute()

        return result as any[]
    }

    public async updateById(id: any, data: any) {
        const row = await this.findByIdOrFail(id)

        let qb = this.db.updateTable(this.table as any) as any

        qb = qb.set(data)
            .where(this.primaryKey, '=', row[this.primaryKey])
            .returningAll()

        await qb.executeTakeFirst()
    }

    public async deleteById(id: any) {
        const row = await this.findByIdOrFail(id)

        let qb = this.db.deleteFrom(this.table as any) as any

        qb = qb.where(this.primaryKey, '=', row[this.primaryKey])

        await qb.executeTakeFirst()
    }

    async deleteMany(options?: DeleteManyOptions & Record<string, any>) {
        const deleteOptions = {
            ...options,
            qb: this.db.deleteFrom(this.table as any)
        }

        let qb = this.query(deleteOptions as any) as any

        if (options?.limit) {
            qb = qb.limit(options.limit)
        }

        await qb.execute()
    }
}
