import { CreateTableBuilder, sql } from 'kysely'
import type { ColumnType } from 'kysely'

export interface TimestampTable {
    created_at: ColumnType<Date, string | undefined, never>
    updated_at: ColumnType<Date, string | undefined, Date | string | ReturnType<typeof now>>
}

declare module 'kysely' {
    interface CreateTableBuilder<TB extends string, C extends string = never> {
        addTimestampColumns(): CreateTableBuilder<TB, C | 'created_at' | 'updated_at'>
        addCreatedColumn(): CreateTableBuilder<TB, C | 'created_at'>
        addUpdatedColumn(): CreateTableBuilder<TB, C | 'updated_at'>
    }
}

const now = () => sql<string>`CURRENT_TIMESTAMP`

CreateTableBuilder.prototype.addTimestampColumns = function(
    this: CreateTableBuilder<any, any>,
) {
    return this
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(now()).notNull())
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(now()).notNull())
}

CreateTableBuilder.prototype.addCreatedColumn = function(
    this: CreateTableBuilder<any, any>,
) {
    return this
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(now()).notNull())
}

CreateTableBuilder.prototype.addUpdatedColumn = function(
    this: CreateTableBuilder<any, any>,
) {
    return this
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(now()).notNull())
}
