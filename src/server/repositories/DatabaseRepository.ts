import type { Kysely } from 'kysely'
import BaseException from '#shared/exceptions/BaseException.ts'
import { now } from '../queries'
import { set } from 'lodash-es'

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

export default class DatabaseRepository<
    TEntity = Record<string, any>,
    TPrimaryKey = any,
    TOptions = Record<string, any>
> {

    public autoCreatedAt = false
    public autoUpdatedAt = false

    constructor(
        protected db: Kysely<any>, 
        protected table: string, 
        protected primaryKey: string
    ) {    }


    public query(options?: { qb?: any } & TOptions) {
        const qb = options?.qb || this.db.selectFrom(this.table as any)

        return qb
    }

    async count(options?: Record<string, any>) {
        let qb = this.query(options as any) as any

        qb = qb.select((eb: any) => eb.fn.countAll().as('count'))

        const result = await qb.executeTakeFirstOrThrow()

        return Number(result.count)
    }

    async findMany(options?: FindManyOptions & TOptions): Promise<TEntity[]> {
        let qb = this.query(options) as any

        qb = qb.selectAll()

        if (options?.limit !== undefined) {
            qb = qb.limit(options.limit)
        }

        if (options?.offset !== undefined) {
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

    async findOne(options?: TOptions): Promise<TEntity | null> {
        let qb = this.query(options as any) as any

        qb = qb.selectAll()

        const item = await qb.executeTakeFirst()

        return item
    }

    async findById(id: TPrimaryKey, options?: TOptions): Promise<TEntity | null> {
        let qb = this.query(options as any) as any

        qb = qb.selectAll()

        qb = qb.where(this.primaryKey, '=', id)

        const item = await qb.executeTakeFirst()

        return item
    }

    async findByIdOrFail(id: TPrimaryKey, options?: TOptions) {
        const item = await this.findById(id, options)

        if (!item) {
            throw new BaseException('Item not found', 404)
        }

        return item
    }

    public async paginate(options?: PaginateOptions & TOptions): Promise<Pagination> {
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
            this.findMany(findAllOptions as any),
            this.count(countOptions as any)
        ])

        return {
            items,
            page,
            per_page: limit,
            total: totalItems,
            total_pages: Math.ceil(totalItems / limit)
        }
    }

    protected async beforeCreate(data: Partial<TEntity>): Promise<Partial<TEntity>> {
        return data
    }

    // @ts-expect-error ignore non used parameter it will be used by the child class
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async afterCreate(data: TEntity): Promise<void> {}

    public async create(data: Partial<TEntity>): Promise<TEntity> {
        if (this.autoCreatedAt) {
            set(data, 'created_at', now())
        }

        if (this.autoUpdatedAt) {
            set(data, 'updated_at', now())
        }

        data = await this.beforeCreate(data) 

        let qb = this.db.insertInto(this.table as any) as any

        qb = qb.values(data).returningAll()

        const result = await qb.executeTakeFirst()

        await this.afterCreate(result)

        return result as any
    }

    protected async beforeCreateMany(data: Partial<TEntity>[]): Promise<Partial<TEntity>[]> {
        return data
    }

    protected async afterCreateMany(data: TEntity[]): Promise<TEntity[]> {
        return data
    }

    public async createMany(data: Partial<TEntity>[]) {
        if (this.autoCreatedAt) {
            data = data.map(item => {
                set(item, 'created_at', now())

                return item
            })
        }
        data = await this.beforeCreateMany(data) 

        let qb = this.db.insertInto(this.table as any) as any

        qb = qb.values(data).returningAll()

        const result = await qb.execute()

        await this.afterCreateMany(result)

        return result as any[]
    }

    // @ts-expect-error ignore non used parameter it will be used by the child class
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async beforeUpdate(data: Partial<TEntity>, id: TPrimaryKey): Promise<Partial<TEntity>> {
        return data
    }

    protected async afterUpdate(data: TEntity): Promise<TEntity> {
        return data
    }

    public async updateById(id: TPrimaryKey, data: Partial<TEntity>) {
        if (this.autoUpdatedAt) {
            set(data, 'updated_at', now())
        }

        data = await this.beforeUpdate(data, id) 

        const row: Record<string, any> = await this.findByIdOrFail(id)

        let qb = this.db.updateTable(this.table as any) as any

        qb = qb.set(data)
            .where(this.primaryKey, '=', row[this.primaryKey])
            .returningAll()

        const updated = await qb.executeTakeFirst()

        await this.afterUpdate(updated)
    }

    // @ts-expect-error ignore non used parameter it will be used by the child class
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async beforeDelete(id: TPrimaryKey): Promise<void> {

    }

    // @ts-expect-error ignore non used parameter it will be used by the child class
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async afterDelete(id: TPrimaryKey): Promise<void> {

    }

    public async deleteById(id: TPrimaryKey) {
        await this.beforeDelete(id)

        const row: Record<string, any> = await this.findByIdOrFail(id)

        let qb = this.db.deleteFrom(this.table as any) as any

        qb = qb.where(this.primaryKey, '=', row[this.primaryKey])

        await qb.executeTakeFirst()

        await this.afterDelete(id)
    }

    protected beforeDeleteMany(options?: DeleteManyOptions & TOptions){
        return options

    }

    // @ts-expect-error ignore non used parameter it will be used by the child class
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected afterDeleteMany(options?: DeleteManyOptions & TOptions): Promise<void> | void {

    }

    async deleteMany(options?: DeleteManyOptions & TOptions) {
        options = this.beforeDeleteMany(options )

        const deleteOptions = {
            ...options,
            qb: this.db.deleteFrom(this.table as any)
        }


        let qb = this.query(deleteOptions as any) as any

        if (options?.limit) {
            qb = qb.limit(options.limit)
        }

        await qb.execute()

        await this.afterDeleteMany(options)
    }
}
