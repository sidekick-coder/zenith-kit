import fs from 'fs'
import path from 'path'
import EmmitterService from '#shared/services/EmmitterService.ts'
import LoggerService from '#shared/services/LoggerService.ts'
import type { Kysely } from 'kysely'
import SeederEntity from '#server/entities/SeederEntity.ts'
import { tryCatch } from '#shared/index.ts'


export interface SeederSource {
    id: string;
    directory: string;
}

export interface ListFilters {
    source?: string | string[];
    name?: string | string[];
}

export interface SeederResult {
    name: string;
    filename: string;
    source: string | null;
    result: 'success' | 'failed';
    error?: any;
}

export interface SeederEvents {
    'seeder:before-run': {
        seeders: string[];
    };
    'seeder:after-run': {
        seeders: string[];
    };
}

export interface MigratorServiceOptions {
    db: Kysely<any>;
    sources?: SeederSource[];
    debug?: boolean;
    emmitter?: EmmitterService;
    logger?: LoggerService
}

export default class SeeederService {
    public static __container_entry_key = 'SeederService'

    public debug = false
    public emmitter: EmmitterService
    public logger: LoggerService
    public db: Kysely<any>
    public sources: SeederSource[]

    constructor(options: MigratorServiceOptions) {
        this.debug = options.debug ?? this.debug
        this.emmitter = options.emmitter || new EmmitterService()
        this.logger = options.logger || new LoggerService()
        this.db = options.db
        this.sources = options.sources || []
    }

    public addSource(source: SeederSource) {
        this.sources.push(source)
    }

    public async listSource(source: SeederSource) {
        const entries = await fs.promises.readdir(source.directory)
                const extensions = ['.js', '.ts', '.mjs', '.mts']


        const items: SeederEntity[] = []

        for (const entry of entries) {
            if (!extensions.includes(path.extname(entry))) {
                continue
            }

            const fullPath = path.join(source.directory, entry)
            const name = path.basename(entry, path.extname(entry))

            const entity = new SeederEntity({
                name,
                source: source.id,
                filename: fullPath,
            })

            items.push(entity)
        }

        return items
    }

    public async list(filters?: ListFilters) {
        let items = [] as SeederEntity[]

        for await (const source of this.sources) {
            const sourceSeeders = await this.listSource(source)

            items.push(...sourceSeeders)
        }

        if (filters?.source) {
            const sources = Array.isArray(filters.source) ? filters.source : [filters.source]

            items = items.filter(i => i.source && sources.includes(i.source))
        }

        if (filters?.name) {
            const names = Array.isArray(filters.name) ? filters.name : [filters.name]

            items = items.filter(i => names.includes(i.name))
        }

        // Sort by name
        items.sort((a, b) => a.name.localeCompare(b.name))

        return items
    }

    public async runSeeder(seeder: SeederEntity): Promise<SeederResult> {
        const [error] = await tryCatch(() => seeder.run(this.db))

        if (error) {
            this.logger.error(`failed to run seeder ${seeder.name}`, error)
            return {
                name: seeder.name,
                filename: seeder.filename,
                source: seeder.source,
                result: 'failed',
                error,
            }
        }

        this.logger.info(`seeder ${seeder.name} ran successfully`)

        return {
            name: seeder.name,
            filename: seeder.filename,
            source: seeder.source,
            result: 'success',
        }
    }


    public async run(filters: ListFilters & { steps?: number } = {}): Promise<SeederResult[]> {
        const items = await this.list(filters)

        await this.emmitter.emitAndWait('seeder:before-run', {
            seeders: items.map(m => m.name)
        })

        const results: SeederResult[] = []

        for (const s of items) {
            const result = await this.runSeeder(s)

            results.push(result)

            // Stop on first failure
            if (result.result === 'failed') {
                break
            }
        }

        await this.emmitter.emitAndWait('seeder:after-run', {
            seeders: results.map(m => m.name),
        })

        return results
    }
}

