import { orderBy } from 'lodash-es'
import BaseException from '#shared/exceptions/BaseException.ts'
import type ConfigService from '#shared/services/ConfigService.ts'
import { createId } from '#shared/utils/createId.ts'

import type { Pagination, FindManyOptions, PaginateOptions, DeleteManyOptions } from '#server/repositories/DatabaseRepository.ts'

export default class ConfigRepository<
    TEntity = Record<string, any>,
    TOptions = Record<string, any>
> {
    constructor(
        protected config: ConfigService,
        protected key: string,
        protected primaryKey: string = 'id'
    ) {}

    protected getItems(): TEntity[] {
        return this.config.get<TEntity[]>(this.key, [])
    }

    protected setItems(items: TEntity[]): void {
        this.config.set(this.key, items)
    }

    // @ts-expect-error - allow passing options for filtering in subclasses 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public query(options?: TOptions): TEntity[] {
        return this.getItems()
    }

    async count(options?: TOptions): Promise<number> {
        return this.query(options).length
    }

    async findMany(options?: FindManyOptions & TOptions): Promise<TEntity[]> {
        let items = this.query(options)

        if (options?.orderBy) {
            const fields = Array.isArray(options.orderBy) ? options.orderBy : [options.orderBy]
            const directions = Array.isArray(options.orderDirection)
                ? options.orderDirection
                : [options.orderDirection ?? 'asc']

            items = orderBy(items, fields, directions)
        }

        if (options?.offset) {
            items = items.slice(options.offset)
        }

        if (options?.limit) {
            items = items.slice(0, options.limit)
        }

        return items
    }

    async findOne(options?: TOptions): Promise<TEntity | null> {
        const items = this.query(options)

        return items[0] ?? null
    }

    async findById(id: string, options?: TOptions): Promise<TEntity | null> {
        const items = this.query(options)

        return items.find(item => (item as any)[this.primaryKey] === id) ?? null
    }

    async findByIdOrFail(id: string, options?: TOptions): Promise<TEntity> {
        const item = await this.findById(id, options)

        if (!item) {
            throw new BaseException('Item not found', 404)
        }

        return item
    }

    async paginate(options?: PaginateOptions & TOptions): Promise<Pagination<TEntity>> {
        const page = options?.page ?? 1
        const limit = options?.limit ?? 10
        const offset = (page - 1) * limit

        const [items, total] = await Promise.all([
            this.findMany({ ...options, limit, offset } as any),
            this.count(options as any),
        ])

        return {
            items,
            page,
            per_page: limit,
            total,
            total_pages: Math.ceil(total / limit),
        }
    }

    async create(data: Partial<TEntity>): Promise<TEntity> {
        const items = this.getItems()

        const item = {
            [this.primaryKey]: createId(),
            ...data,
        } as TEntity

        items.push(item)
        this.setItems(items)

        return item
    }

    async createMany(data: Partial<TEntity>[]): Promise<TEntity[]> {
        const items = this.getItems()

        const created = data.map(d => ({
            [this.primaryKey]: createId(),
            ...d,
        } as TEntity))

        this.setItems([...items, ...created])

        return created
    }

    async updateById(id: string, data: Partial<TEntity>): Promise<TEntity> {
        const items = this.getItems()
        const index = items.findIndex(item => (item as any)[this.primaryKey] === id)

        if (index === -1) {
            throw new BaseException('Item not found', 404)
        }

        items[index] = { ...items[index], ...data }
        this.setItems(items)

        return items[index]
    }

    async deleteById(id: string): Promise<void> {
        await this.findByIdOrFail(id)

        const items = this.getItems().filter(item => (item as any)[this.primaryKey] !== id)

        this.setItems(items)
    }

    async deleteMany(options?: DeleteManyOptions & TOptions): Promise<void> {
        const toDelete = this.query(options as any)
        const limit = options?.limit ?? toDelete.length
        const toDeleteIds = new Set(
            toDelete.slice(0, limit).map(item => (item as any)[this.primaryKey])
        )

        const remaining = this.getItems().filter(item => !toDeleteIds.has((item as any)[this.primaryKey]))

        this.setItems(remaining)
    }
}
