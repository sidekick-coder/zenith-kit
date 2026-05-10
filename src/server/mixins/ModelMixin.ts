import { omit } from 'lodash-es'
import { emitHook } from '#shared/mixins/HooksMixin.ts'
import type { UpdateOrCreateOptions } from '#server/queries/updateOrCreate.ts'
import type { DatabaseContract as Database } from '#server/contracts/DatabaseContract.ts'
import * as queries from '#server/queries/index.ts'

import type { ListOptions } from '#server/queries/list.ts'
import type { PaginateOptions } from '#server/queries/paginate.ts'
import type { CountOptions } from '#server/queries/count.ts'
import type { CreateOptions } from '#server/queries/create.ts'
import type { UpdateOptions } from '#server/queries/update.ts'
import type { DestroyOptions } from '#server/queries/destroy.ts'
import type { FirstOrCreateOptions } from '#server/queries/firstOrCreate.ts'
import type { FindOneOptions } from '#server/queries/findOne.ts'
import type Pagination from '#shared/entities/PaginationEntity.ts'
import type { Constructor } from '#shared/utils/compose.ts'
import db from '#server/facades/database.ts'
import type { SelectQueryBuilder } from 'kysely'

export type ModelListOptions<T extends keyof Database> = Omit<ListOptions<T>, 'serialize'>
export type ModelFindOptions<T extends keyof Database> = Omit<FindOneOptions<T>, 'serialize'|'orderBy'>
export type ModelPaginateOptions<T extends keyof Database> = Omit<PaginateOptions<T>, 'serialize'>
export type ModelCountOptions<T extends keyof Database> = CountOptions<T>
export type ModelCreateOptions<T extends keyof Database> = Omit<CreateOptions<T>, 'serialize'>
export type ModelUpdateOptions<T extends keyof Database> = Omit<UpdateOptions<T>, 'serialize'>
export type ModelDestroyOptions<T extends keyof Database> = DestroyOptions<T>
export type ModelFirstOrCreateOptions<T extends keyof Database> = Omit<FirstOrCreateOptions<T>, 'serialize'>
export type ModelUpdateOrCreateOptions<T extends keyof Database> = Omit<UpdateOrCreateOptions<T>, 'serialize'>

export type ModelEntity = ReturnType<ReturnType<typeof ModelMixin<any>>>

export default function ModelMixin<Table extends keyof Database>(table: Table, primaryKey: keyof Database[Table] = 'id' as any) {
    return function ModelExtend<TBase extends Constructor>(Base: TBase) {
        return class extends Base {            
            public static __model = {
                table,
                primaryKey,
            }
            
            public static serialize<T>(this: new () => T, row: any): Promise<T> {
                const instance = new this() as any

                Object.assign(instance as any, row)

                return instance as any
            }

            public static select(): SelectQueryBuilder<Database, Table, any> {
                return db.selectFrom(table) as any
            }

            // 'this' is the concrete constructor (e.g. Food), so the return type is inferred correctly.
            public static async paginate<T>(this: new () => T, o?: ModelPaginateOptions<Table>): Promise<Pagination<T>> {
                const constructor = this as any

                const pagination = await queries.paginate(table, {
                    ...o,
                    serialize: row => constructor.serialize(row),
                })

                for await (const row of pagination.items) {
                    await emitHook(constructor, 'serialized', row)
                }

                await emitHook(constructor, 'afterPaginate', pagination)

                return pagination as any
            }

            public static async list<T>(this: new () => T, o?: ModelListOptions<Table>): Promise<T[]> {
                const constructor = this as any 

                const items = await queries.list(table, {
                    ...o,
                    serialize: row => constructor.serialize(row),
                })

                for await (const item of items) {
                    await emitHook(constructor, 'serialized', item)
                }

                await emitHook(constructor, 'afterList', items)

                return items as any
            }

            public static async findOne<T>(this: new () => T, o?: ModelFindOptions<Table>): Promise<T | undefined> {
                const constructor = this as any

                const row = await queries.findOne(table, {
                    query: o?.query,
                    where: o?.where,
                    serialize: row => constructor.serialize(row),
                })

                if (row) {
                    await emitHook(constructor, 'serialized', row)
                }

                await emitHook(constructor, 'afterFind', row)                

                return row as any
            }
            

            public static async findOneOrFail<T>(this: new () => T, o?: ModelFindOptions<Table>): Promise<T> {
                const constructor = this as any

                const row = await queries.findOneOrFail(table, {
                    ...o,
                    name: o?.name ?? constructor.name,
                    serialize: row => constructor.serialize(row),
                })

                await emitHook(constructor, 'serialized', row)
                await emitHook(constructor, 'afterFind', row)

                return row as any
            }

            public static async find<T>(this: new () => T, id: any): Promise<T | null> {
                const constructor = this as any

                const row = await queries.findOne(table,{
                    serialize: row => constructor.serialize(row),
                    where: (qb: any) => qb(primaryKey as string, '=', id)
                }) as any

                if (row) {
                    await emitHook(constructor, 'serialized', row)
                    await emitHook(constructor, 'afterFind', row)
                }


                return row as any
            }

            public static async findOrFail<T>(this: new () => T, id: any): Promise<T> {
                const constructor = this as any

                const row = await queries.findOneOrFail(table, {
                    name: constructor.name,
                    serialize: row => constructor.serialize(row),
                    where: (qb: any) => qb(primaryKey as string, '=', id)
                }) as any

                await emitHook(constructor, 'serialized', row)
                await emitHook(constructor, 'afterFind', row)

                return row as any
            }

            public static async findBy<T>(this: new () => T, column: keyof Database[Table], value: any): Promise<T> {
                const constructor = this as any

                const row = await queries.findOneOrFail(table, {
                    serialize: row => constructor.serialize(row),
                    where: (qb: any) => qb(column as string, '=', value)
                }) as any

                await emitHook(constructor, 'serialized', row)
                await emitHook(constructor, 'afterFind', row)

                return row as any
            }

            public static async findByOrFail<T>(this: new () => T, column: keyof Database[Table], value: any): Promise<T> {
                const constructor = this as any

                const row = await queries.findOneOrFail(table, {
                    name: constructor.name,
                    serialize: row => constructor.serialize(row),
                    where: (qb: any) => qb(column as string, '=', value)
                }) as any

                await emitHook(constructor, 'serialized', row)
                await emitHook(constructor, 'afterFind', row)

                return row as any
            }

            public static exists<T>(this: new () => T, o?: ModelListOptions<Table>): boolean {
                return queries.exists(table, { query: o?.query }) as any
            }

            public static count<T>(this: new () => T, o?: ModelCountOptions<Table>): number {
                return queries.count(table, o) as any
            }

            public static async create<T>(this: new () => T, payload: ModelCreateOptions<Table>['values']): Promise<T> {
                const constructor = this as any

                const values = { ...payload }

                await emitHook(constructor, 'beforeCreate', values)

                const row = await queries.create(table, {
                    serialize: row => constructor.serialize(row),
                    values: values,
                }) as any

                await emitHook(constructor, 'afterCreate', row)
                await emitHook(constructor, 'serialized', row)
                await emitHook(constructor, 'afterFind', row)

                return row
            }

            public static async createMany<T>(this: new () => T, values: Array<ModelCreateOptions<Table>['values']>): Promise<T[]> {
                const constructor = this as any

                const rows  = []

                for await (const value of values) {
                    await emitHook(constructor, 'beforeCreate', value)

                    const row = await queries.create(table, {
                        values: value,
                        serialize: row => constructor.serialize(row),
                    })

                    await emitHook(constructor, 'afterCreate', row)
                    await emitHook(constructor, 'serialized', row)
                    await emitHook(constructor, 'afterFind', row)

                    rows.push(row)
                }

                return rows as any
            }

            public static async update<T>(this: new () => T, o: ModelUpdateOptions<Table>): Promise<T> {
                const constructor = this as any

                const values = { ...o.values }

                await emitHook(constructor, 'beforeUpdate', values, o.where)

                await queries.update(table, {
                    debug: o.debug,
                    where: o.where,
                    values: values,
                    serialize: row => constructor.serialize(row),
                })

                const row = await queries.findOneOrFail(table, {
                    where: o.where,
                    serialize: row => constructor.serialize(row),
                }) as any

                await emitHook(constructor, 'afterUpdate', row)

                return row
            }

            public static updateById<T>(this: new () => T, id: any, values: ModelUpdateOptions<Table>['values'], options?: { debug?: boolean }): Promise<T> {
                const constructor = this as any

                return constructor.update({
                    debug: options?.debug,
                    where: (qb: any) => qb(primaryKey as string, '=', id),
                    values: values,
                }) as any
            }

            public static async destroy<T>(this: new () => T, o?: ModelDestroyOptions<Table>): Promise<void> {
                const constructor = this as any

                await emitHook(constructor, 'beforeDestroy', o)

                await queries.destroy(table, o)

                await emitHook(constructor, 'afterDestroy', o)
            }

            public static firstOrCreate<T>(this: new () => T, o: ModelFirstOrCreateOptions<Table>): T {
                const constructor = this as any

                return queries.firstOrCreate(table, {
                    ...o,
                    serialize: row => constructor.serialize(row),
                }) as any
            }

            public static updateOrCreate<T>(this: new (...args: any[]) => T, o: ModelUpdateOrCreateOptions<Table>): T {
                const constructor = this as any
                 
                return queries.updateOrCreate(table, {
                    debug: o.debug,
                    where: o.where,
                    select: o.select,
                    update: o.update,
                    values: o.values,
                    serialize: row => constructor.serialize(row),
                }) as any
            }

            public static async destroyById<T>(this: new () => T, id: any): Promise<void> {
                const constructor = this as any
                const options = {
                    query: (qb: any) => qb.where(primaryKey as string, '=', id)
                }

                await emitHook(constructor, 'beforeDestroy', options)

                await queries.destroy(table, options)

                await emitHook(constructor, 'afterDestroy', options)
            }

            public async save() {
                const constructor = (this as any).constructor
                const values = omit(this as any, [primaryKey as string])

                await emitHook(constructor, 'beforeSave', this, values)

                await queries.update(table, {
                    where: (qb: any) => qb(primaryKey, '=', (this as any)[primaryKey]),
                    values: values,
                })

                await emitHook(constructor, 'afterSave', this)
            }

            public async destroy() {
                const constructor = (this as any).constructor

                await emitHook(constructor, 'beforeDestroy', this)

                await queries.destroy(table, {
                    query: qb => (qb as any).where(primaryKey, '=', (this as any).id)
                })

                await emitHook(constructor, 'afterDestroy', this)
            }

            public async softDelete() {
                const constructor = (this as any).constructor

                await emitHook(constructor, 'beforeSoftDelete', this)

                const rows = await queries.softDelete(table, {
                    query: qb => (qb as any).where(primaryKey, '=', (this as any).id)
                })

                const row = rows[0]

                Object.assign(this as any, row)

                await emitHook(constructor, 'afterSoftDelete', this)
            }
        }
    }
}
