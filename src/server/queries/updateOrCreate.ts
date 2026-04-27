import type { ExpressionBuilder, ExpressionWrapper, Insertable } from 'kysely'
import type { SelectFrom, SerializableResult, SerializeOptions, UpdateFrom } from './common.ts'
import { create } from './create.ts'
import { update } from './update.ts'
import { findOne } from './findOne.ts'
import type { Database } from '#server/contracts/database.contract.ts'

export interface UpdateOrCreateOptions<T extends keyof Database> extends SerializeOptions<T> {
    debug?: boolean
    where?: (qb: ExpressionBuilder<Database, T>) => ExpressionWrapper<Database, T, any>
    select?: (qb: SelectFrom<T>) => SelectFrom<T>
    update?: (qb: UpdateFrom<T>) => UpdateFrom<T>
    values: Insertable<Database[T]> | Insertable<Database[T]>[]
}

export async function updateOrCreate<T extends keyof Database, O extends UpdateOrCreateOptions<T>>(table: T, options?: O) {
    const item = await findOne(table, { 
        debug: options?.debug,
        serialize: options?.serialize,  
        where: options?.where,
    })

    if (item) {
        await update(table, { 
            debug: options?.debug,
            serialize: options?.serialize,
            values: options?.values as any,
            where: options?.where
        })

        return findOne(table, { 
            debug: options?.debug,
            serialize: options?.serialize,  
            where: options?.where,
        }) as Promise<SerializableResult<T, O>>
    }

    const created = await create(table, { 
        debug: options?.debug,
        serialize: options?.serialize,
        values: options?.values as any
    })

    return created as SerializableResult<T, O>
}