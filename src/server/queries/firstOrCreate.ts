import type { ExpressionBuilder, ExpressionWrapper, Insertable } from 'kysely'
import type { SelectFrom, SerializableResult, SerializeOptions } from './common.ts'
import { list } from './list.ts'
import { create } from './create.ts'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'

export interface FirstOrCreateOptions<T extends keyof Database> extends SerializeOptions<T> {
    debug?: boolean
    select?: (qb: SelectFrom<T>) => SelectFrom<T>
    where?: (qb: ExpressionBuilder<Database, T>) => ExpressionWrapper<Database, T, any>
    values: Insertable<Database[T]> | Insertable<Database[T]>[]
}

export async function firstOrCreate<T extends keyof Database, O extends FirstOrCreateOptions<T>>(table: T, options?: O) {
    const items = await list(table, { 
        debug: options?.debug,
        serialize: options?.serialize,
        where: options?.where,
        query: () => {
            let query: any = options?.select 
                ? options.select(db.selectFrom(table)) 
                : db.selectFrom(table).selectAll()

            if (options?.where) {
                query = query.where((eb: any) => options.where!(eb))
            }

            return query.limit(1)
        }
    })

    if (items.length > 0) {
        return items[0] as SerializableResult<T, O>
    }

    const created = await create(table, { 
        debug: options?.debug,
        serialize: options?.serialize,
        values: options?.values as any
    })

    return created as SerializableResult<T, O>
}