import type { Kysely } from "kysely";

export async function up(db: Kysely<any>) {
    return db.schema.createTable('users')
        .addColumn('id', 'integer', col => col.primaryKey())
        .addColumn('name', 'varchar(255)')
        .addColumn('username', 'varchar(255)', col => col.notNull())
        .addColumn('email', 'varchar(255)', col => col.notNull())
        .addColumn('password', 'text', col => col.notNull())
        .addColumn('verified_at', 'timestamp')
        .addColumn('created_at', 'timestamp')
        .addColumn('updated_at', 'timestamp')
        .addColumn('deleted_at', 'timestamp')
        .execute()
}

export async function down(db: Kysely<any>) {
    return db.schema.dropTable('users').execute()
}
