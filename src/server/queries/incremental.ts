import { CreateTableBuilder } from 'kysely'
import db from '#server/facades/db.facade.ts'

declare module 'kysely' {
  interface CreateTableBuilder<TB extends string, C extends string = never> {
    addIdColumn<CN extends string = 'id'>(
      col?: CN
    ): CreateTableBuilder<TB, C | CN>
  }
}

CreateTableBuilder.prototype.addIdColumn = function (
    this: CreateTableBuilder<any, any>,
    col: string = 'id'
) {
    if (db.driver === 'postgresql') {
        return this.addColumn(col, 'serial', col => col.primaryKey())
    }

    if (db.driver === 'mysql') {
        return this.addColumn(col, 'integer', col => col.primaryKey().autoIncrement())
    }

    return this.addColumn(col, 'integer', col => col.primaryKey())
}