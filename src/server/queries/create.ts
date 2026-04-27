import type { Insertable } from 'kysely'
import type { SerializableResult, SerializeOptions } from './common.ts'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'
import normalizers from '#server/normalizers/index.ts'

export interface CreateOptions<T extends keyof Database> extends SerializeOptions<T> {
    values: Insertable<Database[T]>
    primaryKey?: string // default 'id'
    normalize?: boolean | ((value: any) => any) // default true
}


export async function createDefault<T extends keyof Database, O extends CreateOptions<T>>(table: T, options?: O) {
    const values = (options?.values || {}) as Insertable<Database[T]>
    const insert = db.insertInto(table).values(values)

    let row: any = await insert.returningAll().executeTakeFirst()

    if (options?.serialize) {
        row = options.serialize(row)
    }

    return row as SerializableResult<T, O>
}

export async function createMysql<T extends keyof Database, O extends CreateOptions<T>>(table: T, options?: O) {
    const values = (options?.values || {}) as Insertable<Database[T]>
    const insert = db.insertInto(table).values(values)

    const primaryKey = (options?.primaryKey || 'id') as keyof Database[T]

    const result = await insert.executeTakeFirst()

    const resultId = result.insertId as any

    const select = db.selectFrom(table).selectAll() as any

    let row = await select
        .where(primaryKey, '=', resultId)
        .executeTakeFirst()

    if (options?.serialize) {
        row = options.serialize(row)
    }

    return row as SerializableResult<T, O>
}


export async function create<T extends keyof Database, O extends CreateOptions<T>>(table: T, options?: O) {
    let values: any = options?.values || {}

    const normalize = typeof options?.normalize === 'function' ? options?.normalize : normalizers.all.toDb

    if (options?.normalize !== false) {
        values = normalize(values)
    }

    const parsedOptions = {
        ...options,
        values
    }

    if (db.driver === 'mysql') {
        return createMysql(table, parsedOptions)
    }

    return createDefault(table, parsedOptions)
}