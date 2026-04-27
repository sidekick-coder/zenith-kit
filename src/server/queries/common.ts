import {  sql  } from 'kysely'
import type { Selectable, SelectQueryBuilder, ExpressionBuilder as KExpressionBuilder } from 'kysely'
import db from '#server/facades/db.facade.ts'
import type { Database } from '#server/contracts/database.contract.ts'

export type SelectFrom<T extends keyof Database> =
    ReturnType<typeof db.selectFrom<T>>
    | SelectQueryBuilder<Database, T, any>

export type InsertFrom<T extends keyof Database> = ReturnType<typeof db.insertInto<T>>
export type UpdateFrom<T extends keyof Database> = ReturnType<typeof db.updateTable<T>>
export type DeleteFrom<T extends keyof Database> = ReturnType<typeof db.deleteFrom<T>>

export type SelectBuilder<T extends keyof Database> = SelectQueryBuilder<Database, T, Selectable<Database[T]>>
export type ExpressionBuilder<T extends keyof Database> = KExpressionBuilder<Database, T>

export const now = ()  => sql<string>`CURRENT_TIMESTAMP`

export interface SerializeOptions<T extends keyof Database> {
    serialize?: (row: Selectable<Database[T]>) => any
}

export type SerializableResult<T extends keyof Database, O extends SerializeOptions<T> | undefined> =
    O extends undefined ? Selectable<Database[T]> :
    O extends { serialize: (row: Selectable<Database[T]>) => infer R } ? R : Selectable<Database[T]>