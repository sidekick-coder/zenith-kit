import { CreateTableBuilder  } from 'kysely'
import { now } from './common.ts'

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
