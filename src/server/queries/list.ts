import type { ExpressionBuilder, ExpressionWrapper } from 'kysely'
import type { SelectFrom, SerializeOptions, SerializableResult } from './common.ts'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'

export interface ListOptions<T extends keyof Database>  extends SerializeOptions<T> {
    limit?: number
    offset?: number
    debug?: boolean
    where?: (qb: ExpressionBuilder<Database, T>) => ExpressionWrapper<Database, T, any>
    query?: (qb: SelectFrom<T>) => SelectFrom<T>
}

export async function list<T extends keyof Database, O extends ListOptions<T>>(table: T, options?: O) {
    let query = (options?.query || db.selectFrom(table).selectAll()) as any

    if (options?.query) {
        query = options.query(db.selectFrom(table)) 
    }

    if (options?.where) {
        query = query.where((eb: any) => options.where!(eb))
    }

    if (options?.limit) {
        query = query.limit(options.limit)
    }

    if (options?.offset) {
        query = query.offset(options.offset)
    }

    if (options?.debug) {
        console.log(query.compile())
    }

    let rows: any[] = await query.execute()

    if (options?.serialize) {
        rows = rows.map(options.serialize)
    }

    return rows as SerializableResult<T, O>[]
}