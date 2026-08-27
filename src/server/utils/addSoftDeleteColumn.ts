import { CreateTableBuilder, type ColumnType } from 'kysely'

export interface SoftDeleteTable {
  deleted_at: ColumnType<Date | null, never | null | string | null>
}

declare module 'kysely' {
    interface CreateTableBuilder<TB extends string, C extends string = never> {
        addSoftDeleteColumn(): CreateTableBuilder<TB, C | 'deleted_at'>
    }
}

CreateTableBuilder.prototype.addSoftDeleteColumn = function(
    this: CreateTableBuilder<any, any>,
) {
    return this.addColumn('deleted_at', 'timestamp')
}
