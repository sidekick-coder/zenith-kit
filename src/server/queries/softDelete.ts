import { CreateTableBuilder  } from 'kysely'
import type { ColumnType, ExpressionBuilder } from 'kysely'
import type { Selectable } from 'kysely'
import { now } from './common.ts'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'

type WhereCapable<QB> = {
  where: (...args: any[]) => QB
}

type UpdateFrom<T extends keyof Database> = ReturnType<typeof db.updateTable<T>>

export interface SoftDeleteOptions<T extends keyof Database> {
    serialize?: (row: Selectable<Database[T]>) => any
    query: (qb: UpdateFrom<T>) => UpdateFrom<T>
}

export type SoftDeleteResult<T extends keyof Database, O extends SoftDeleteOptions<T> | undefined> =
    O extends undefined ? Selectable<Database[T]>[] :
    O extends { serialize: (row: Selectable<Database[T]>) => infer R } ? R[] : Selectable<Database[T]>[]

export interface SoftDeleteTable {
  deleted_at: ColumnType<Date | null, never | null | ReturnType<typeof now>, string | null | ReturnType<typeof now>>
}

export function whereNotDeleted<QB extends WhereCapable<QB>>(qb: QB): QB {
    return qb.where('deleted_at', 'is', null)
}

export function undeleted (qb: ExpressionBuilder<any, any>) {
    return qb.eb(qb.ref('deleted_at'), 'is', null)
}

undeleted.column = (col: string) => {
    return (qb: ExpressionBuilder<any, any>) => {
        return qb.eb(col, 'is', null)
    }
}


export const deleted = (qb: ExpressionBuilder<any, any>) => {
    return qb.eb('deleted_at', 'is not', null)
}

export const addSoftDeleteColumn = (ctb: CreateTableBuilder<any, any>) => {
    return ctb.addColumn('deleted_at', 'timestamp')
}

export async function softDelete<T extends keyof Database, O extends SoftDeleteOptions<T>>(table: T, options?: O): Promise<SoftDeleteResult<T, O>> {
    let query: any = options?.query 
        ? options.query(db.updateTable(table)) 
        : db.updateTable(table)

    query = query.set({ deleted_at: now() }).where(undeleted)

    let rows: any[] = await query
        .returningAll()
        .execute()

    if (options?.serialize) {
        rows = rows.map(options.serialize)
    }

    return rows as SoftDeleteResult<T, O>
}

declare module 'kysely' {
  interface CreateTableBuilder<TB extends string, C extends string = never> {
    addSoftDeleteColumn(): CreateTableBuilder<TB, C | 'deleted_at'>
  }
}

CreateTableBuilder.prototype.addSoftDeleteColumn = function (
    this: CreateTableBuilder<any, any>,
) {
    return this.addColumn('deleted_at', 'timestamp')
}