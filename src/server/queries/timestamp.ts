import { CreateTableBuilder  } from 'kysely'
import type { ColumnType } from 'kysely'
import { now } from './common.ts'

export interface TimestampTable {
  created_at: ColumnType<Date, string | undefined, never>
  updated_at: ColumnType<Date, string | undefined, Date | string | ReturnType<typeof now>>
}

export const addCreatedColumn = (ctb: CreateTableBuilder<any, any>) => {
    return ctb
        .addColumn('created_at', 'timestamp', (col) =>  col.defaultTo(now()).notNull())
}

export const addUpdatedColumn = (ctb: CreateTableBuilder<any, any>) => {
    return ctb
        .addColumn('updated_at', 'timestamp', (col) =>  col.defaultTo(now()).notNull())
}

export const addTimestampColumns = (ctb: CreateTableBuilder<any, any>) => {
    return ctb
        .addColumn('created_at', 'timestamp', (col) =>  col.defaultTo(now()).notNull())
        .addColumn('updated_at', 'timestamp', (col) =>  col.defaultTo(now()).notNull())
}

declare module 'kysely' {
  interface CreateTableBuilder<TB extends string, C extends string = never> {
    addTimestampColumns(): CreateTableBuilder<TB, C | 'created_at' | 'updated_at'>
    addCreatedColumn(): CreateTableBuilder<TB, C | 'created_at'>
    addUpdatedColumn(): CreateTableBuilder<TB, C | 'updated_at'>
  }
}

CreateTableBuilder.prototype.addTimestampColumns = function (
    this: CreateTableBuilder<any, any>,
) {
    return this
        .addColumn('created_at', 'timestamp', (col) =>  col.defaultTo(now()).notNull())
        .addColumn('updated_at', 'timestamp', (col) =>  col.defaultTo(now()).notNull())
}

CreateTableBuilder.prototype.addCreatedColumn = function (
    this: CreateTableBuilder<any, any>,
) {
    return this
        .addColumn('created_at', 'timestamp', (col) =>  col.defaultTo(now()).notNull())
}

CreateTableBuilder.prototype.addUpdatedColumn = function (
    this: CreateTableBuilder<any, any>,
) {
    return this
        .addColumn('updated_at', 'timestamp', (col) =>  col.defaultTo(now()).notNull())
}