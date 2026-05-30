import MigratorService from '#server/services/MigratorService.ts'
import Database from 'better-sqlite3'
import { Kysely, SqliteDialect } from 'kysely'
import { createTestMigrator } from './createTestMigrator'
import container from '#server/facades/container.ts'
import { key } from '#server/facades/database.ts'

export class TestDb extends Kysely<any> {
    public migrator: MigratorService

    constructor() {
        super({
            dialect: new SqliteDialect({
                database: new Database(':memory:')
            })
        })

        this.migrator = createTestMigrator(this)
    }

    public provide() {
        container.set(key, this)
    }

    public dispose() {
        this.destroy()

        container.unset(key)
    }

    public async setup() {
        this.provide()
        await this.migrator.latest()
    }

    public async teardown() {
        await this.migrator.rollback()
        this.dispose()
    }
}

export function createTestDb() {
    const db = new TestDb()

    return db
}
