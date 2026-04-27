import type { ExpressionWrapper, ExpressionBuilder } from 'kysely'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'

type DeleteFrom<T extends keyof Database> = ReturnType<typeof db.deleteFrom<T>>

export interface DestroyOptions<T extends keyof Database> {
    query?: (qb: DeleteFrom<T>) => DeleteFrom<T>
    where?: (qb: ExpressionBuilder<Database, T>) => ExpressionWrapper<Database, T, any>
}

export async function destroy<T extends keyof Database, O extends DestroyOptions<T>>(table: T, options?: O) {
    let query: any = options?.query 
        ? options.query(db.deleteFrom(table)) 
        : db.deleteFrom(table)

    if (options?.where) {
        query = query.where((eb: any) => options.where!(eb)) as any
    }

    await query.execute()
}