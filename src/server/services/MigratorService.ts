import fs from 'fs'
import path from 'path'
import { format } from 'date-fns'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import EmmitterService from '#shared/services/EmmitterService.ts'
import LoggerService from '#shared/services/LoggerService.ts'
import type { Kysely } from 'kysely'
import MigrationEntity from '#server/entities/MigrationEntity.ts'
import { orderBy } from 'lodash-es'

export interface MigrationSource {
    id: string;
    directory: string;
}

export interface Migration {
    name: string;
    source: string | null;
    filename: string;
    executedAt: Date | null;
}

export interface ListFilters {
    source?: string;
}

interface MigrationResult {
    name: string;
    filename: string;
    source: string | null;
    result: 'success' | 'failed';
    error?: any;
}

export interface MigratorServiceOptions {
    sources: MigrationSource[];
    db: Kysely<any>;
    debug?: boolean;
    emmitter?: EmmitterService;
    logger?: LoggerService
}

export default class MigratorService {
    public static __container_entry_key = 'MigratorService'

    public debug = false
    public emmitter: EmmitterService
    public logger: LoggerService
    public db: Kysely<any>
    public sources: MigrationSource[]

    constructor(options: MigratorServiceOptions) {
        this.debug = options.debug ?? this.debug
        this.emmitter = options.emmitter || new EmmitterService()
        this.logger = options.logger || new LoggerService()
        this.db = options.db
        this.sources = options.sources
    }

    public addSource(source: MigrationSource) {
        this.sources.push(source)
    }

    private async ensureMigrationsTable() {
        await this.db.schema
            .createTable('migrations')
            .ifNotExists()
            .addColumn('name', 'varchar(255)', (col) => col.primaryKey())
            .addColumn('module', 'varchar(255)') // module will be renamed to source in future versions
            .addColumn('executed_at', 'timestamp', (col) => col.notNull())
            .execute()
    }

    public async listSource(source: MigrationSource) {
        const entries = await fs.promises.readdir(source.directory)
        const extensions = ['.js', '.ts', '.mjs', '.mts']

        const items: MigrationEntity[] = []

        for (const entry of entries) {
            if (!extensions.some(ext => entry.endsWith(ext))) continue

            const fullPath = path.join(source.directory, entry)
            const name = path.basename(entry, path.extname(entry))

            const entity = new MigrationEntity({
                name,
                source: source.id,
                filename: fullPath,
                executedAt: null,
            })

            items.push(entity)
        }

        return items
    }

    public async list(filters?: ListFilters) {
        await this.ensureMigrationsTable()

        let items = [] as MigrationEntity[]

        for await (const source of this.sources) {
            const migrations = await this.listSource(source)

            items.push(...migrations)
        }

        // Get executed migrations from database
        const executed = await this.db
            .selectFrom('migrations')
            .selectAll()
            .execute()

        for (const e of executed) {
            if (!e.source) {
                e.source = 'root'
            }

            const m = items.find(m => m.name === e.name)

            if (!m) continue

            m.executedAt = new Date(e.executed_at)
        }

        if (filters?.source) {
            items = items.filter(m => m.source === filters.source)
        }

        items = orderBy(items, ['source', 'name'], ['asc', 'asc'])

        return items
    }

    private async migrateUp(migration: MigrationEntity): Promise<void> {
        await migration.up(this.db)

        await this.db
            .insertInto('migrations')
            .values({
                name: migration.name,
                module: migration.source,
                executed_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            })
            .execute()

        this.logger.info(`${migration.name} migrated successfully`)

    }

    private async migrateDown(migration: MigrationEntity): Promise<void> {
        await migration.down(this.db)

        await this.db
            .deleteFrom('migrations')
            .where('name', '=', migration.name)
            .where('module', '=', migration.source)
            .execute()

        this.logger.info(`${migration.name} rolled back successfully`)
    }

    public async migrateFile(filename: string): Promise<MigrationResult> {
        await this.ensureMigrationsTable()

        const migrations = await this.list()
        const migration = migrations.find(m => m.filename === filename)

        if (!migration) {
            return {
                name: path.basename(filename, path.extname(filename)),
                filename: filename,
                source: null,
                result: 'failed',
                error: new Error(`Migration ${filename} not found`)
            }
        }

        if (migration.executedAt) {
            return {
                name: migration.name,
                filename: migration.filename,
                source: migration.source,
                result: 'success',
            }
        }

        const [error] = await tryCatch(() => this.migrateUp(migration))

        if (error) {
            return {
                name: migration.name,
                filename: migration.filename,
                source: migration.source,
                result: 'failed',
                error
            }
        }

        return {
            name: migration.name,
            filename: migration.filename,
            source: migration.source,
            result: 'success'
        }
    }

    public async rollbackFile(filename: string): Promise<MigrationResult> {
        await this.ensureMigrationsTable()

        const migrations = await this.list()
        const migration = migrations.find(m => m.filename === filename)

        if (!migration) {
            return {
                name: path.basename(filename, path.extname(filename)),
                filename: filename,
                source: null,
                result: 'failed',
                error: `Migration ${filename} not found`
            }
        }

        if (!migration.executedAt) {
            return {
                name: migration.name,
                filename: migration.filename,
                source: migration.source,
                result: 'success',
            }
        }

        const [error] = await tryCatch(() => this.migrateDown(migration))

        if (error) {
            return {
                name: migration.name,
                filename: migration.filename,
                source: migration.source,
                result: 'failed',
                error
            }
        }

        return {
            name: migration.name,
            filename: migration.filename,
            source: migration.source,
            result: 'success'
        }
    }

    public async migrate(filters: ListFilters & { steps?: number } = {}): Promise<MigrationResult[]> {
        await this.ensureMigrationsTable()

        let migrations = await this.list(filters)

        migrations = migrations.filter(m => !m.executedAt)

        migrations.sort((a, b) => a.name.localeCompare(b.name))

        if (filters.steps !== undefined) {
            migrations = migrations.slice(0, filters.steps)
        }

        if (migrations.length === 0) {
            return []
        }

        await this.emmitter.emitAndWait('migrator:before-migrate', {
            migrations: migrations.map(m => m.name)
        })

        const results: MigrationResult[] = []

        for (const migration of migrations) {
            const result = await this.migrateFile(migration.filename)

            results.push(result)

            // Stop on first failure
            if (result.result === 'failed') {
                break
            }
        }

        await this.emmitter.emitAndWait('migrator:after-migrate', {
            migrations: migrations,
            results
        })

        return results
    }

    public async rollback(filters: ListFilters & { steps?: number } = {}): Promise<MigrationResult[]> {
        await this.ensureMigrationsTable()

        let migrations = await this.list(filters)

        migrations = migrations.filter(m => m.executedAt)

        migrations.sort((a, b) => b.name.localeCompare(a.name))


        if (filters.steps !== undefined) {
            migrations = migrations.slice(0, filters.steps)
        }

        if (migrations.length === 0) {
            return []
        }

        await this.emmitter.emitAndWait('migrator:before-rollback', {
            migrations: migrations.map(m => m.name)
        })

        const results: MigrationResult[] = []

        for (const migration of migrations) {
            const result = await this.rollbackFile(migration.filename)

            results.push(result)

            // Stop on first failure
            if (result.result === 'failed') {
                break
            }
        }

        await this.emmitter.emitAndWait('migrator:after-rollback', {
            migrations: migrations.map(m => m.name)
        })

        return results
    }

    public async up(steps: number = 1, filters: ListFilters = {}): Promise<MigrationResult[]> {
        return this.migrate({
            ...filters,
            steps
        })
    }

    public async down(steps: number = 1, filters: ListFilters = {}): Promise<MigrationResult[]> {
        return this.rollback({
            ...filters,
            steps
        })
    }

    public async latest(filters: ListFilters = {}): Promise<MigrationResult[]> {
        return this.migrate(filters)
    }

    public async latestOrFail(filters: ListFilters = {}): Promise<MigrationResult[]> {
        const results = await this.latest(filters)

        if (results.some(r => r.result === 'failed')) {
            const error = new Error('Failed to run all migrations')

            Object.assign(error, { results })

            throw error
        }

        return results
    }

    public async fresh(filters: ListFilters & { steps?: number } = {}): Promise<MigrationResult[]> {
        const downResults = await this.rollback(filters)

        if (downResults.some(r => r.result === 'failed')) {
            return downResults
        }

        const upResults = await this.migrate(filters)

        return upResults
    }

}

