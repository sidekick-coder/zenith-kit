import { CreateTableBuilder } from 'kysely'
import db from '#server/facades/database.ts'

declare module 'kysely' {
    interface CreateTableBuilder<TB extends string, C extends string = never> {
        addIdColumn<CN extends string = 'id'>(
            col?: CN
        ): CreateTableBuilder<TB, C | CN>
    }
}

CreateTableBuilder.prototype.addIdColumn = function(
    this: CreateTableBuilder<any, any>,
    col: string = 'id'
) {
    if (db._dialect_identifier === 'postgresql') {
        return this.addColumn(col, 'serial', col => col.primaryKey())
    }

    if (db._dialect_identifier === 'mysql') {
        return this.addColumn(col, 'integer', col => col.primaryKey().autoIncrement())
    }

    return this.addColumn(col, 'integer', col => col.primaryKey())
}
