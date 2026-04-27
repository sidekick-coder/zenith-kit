import type { Updateable, ExpressionBuilder, ExpressionWrapper } from 'kysely'
import type { UpdateFrom, SerializableResult, SerializeOptions } from './common.ts'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'
import normalizers from '#server/normalizers/index.ts'

export interface UpdateOptions<T extends keyof Database> extends SerializeOptions<T> {
    debug?: boolean
    values: Updateable<Database[T]>
    normalize?: boolean | ((value: any) => any) // default true
    where?: (qb: ExpressionBuilder<Database, T>) => ExpressionWrapper<Database, T, any>
    query?: (qb: UpdateFrom<T>) => UpdateFrom<T>
}

export async function updateDefault<T extends keyof Database, O extends UpdateOptions<T>>(table: T, options?: O) {
    const values = options?.values || []
    let query = db.updateTable(table) as any

    query = query.set(values).returningAll()

    if (options?.query) {
        query = options.query(query)
    }

    if (options?.where) {
        query = query.where((eb: any) => options.where!(eb))
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

export async function updateMysql<T extends keyof Database, O extends UpdateOptions<T>>(table: T, options?: O) {
    const values = options?.values || []
    const updateQb = db.updateTable(table) as any

    if (options?.where) {
        updateQb.where((eb: any) => options.where!(eb))
    }

    await updateQb.set(values).execute()

    const selectQb = db.selectFrom(table).selectAll() as any

    if (options?.where) {
        selectQb.where((eb: any) => options.where!(eb))
    }

    if (options?.debug) {
        console.log(selectQb.compile())
    }

    let rows: any[] = await selectQb.execute()

    if (options?.serialize) {
        rows = rows.map(options.serialize)
    }

    return rows as SerializableResult<T, O>[]
}

export async function update<T extends keyof Database, O extends UpdateOptions<T>>(table: T, options?: O) {
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
        return updateMysql(table, parsedOptions)
    }

    return updateDefault(table, parsedOptions)
}