import type { SelectFrom } from './common.ts'
import type { DatabaseContract as Database } from '#server/contracts/DatabaseContract.ts'
import db from '#server/facades/database.ts'

export interface CountOptions<T extends keyof Database> {
    query?: (qb: SelectFrom<T>) => SelectFrom<T>
    debug?: boolean
}

export async function count<T extends keyof Database, O extends CountOptions<T>>(table: T, options?: O): Promise<number> {
    let query = db.selectFrom(table) as any 

    if (options?.query) {
        query = options.query(db.selectFrom(table)) 
    }

    query = query
        .clearSelect()
        .clearOrderBy()
        .select((eb: any) => eb.fn.countAll().as('count'))

    if (options?.debug) {
        console.log(query.compile())
    }

    const row = await (query as any).executeTakeFirst()

    return Number(row?.count ?? 0)
}