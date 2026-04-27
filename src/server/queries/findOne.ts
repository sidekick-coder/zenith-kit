import type { ExpressionBuilder, ExpressionWrapper } from 'kysely'
import type { SelectFrom, SerializableResult, SerializeOptions } from './common.ts'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'
import BaseException from '#server/exceptions/base.ts'

export interface FindOneOptions<T extends keyof Database> extends SerializeOptions<T> {
    name?: string
    query?: (qb: SelectFrom<T>) => SelectFrom<T>
    where?: (qb: ExpressionBuilder<Database, T>) => ExpressionWrapper<Database, T, any>
}

export async function findOne<T extends keyof Database, O extends FindOneOptions<T>>(table: T, options?: O) {
    let query = db.selectFrom(table).selectAll() as any

    if (options?.query) {
        query = options.query(query) as any
    }

    if (options?.where) {
        query = query.where((eb: any) => options.where!(eb)) as any
    }

    const row: any = await query.limit(1).executeTakeFirst()

    if (!row) {
        return null
    }

    if (options?.serialize) {
        return options.serialize(row) as SerializableResult<T, O>
    }

    return row as SerializableResult<T, O>
}

export async function findOneOrFail<T extends keyof Database, O extends FindOneOptions<T>>(table: T, options?: O) {
    const found = await findOne(table, options)

    if (!found) {
        const name = options?.name ?? 'Record'
        throw new BaseException(`${name} not found`, 404)
    }

    return found
}