import MigratorService from "#server/services/MigratorService.ts";
import type { Kysely } from "kysely";
import path from "path";

export function createTestMigrator(db: Kysely<any>) {
    const migrator = new MigratorService({
        db,
        sources: []
    })

    migrator.addSource({
        id: 'test-migrations',
        directory: path.resolve(import.meta.dirname, '..', 'migrations'),
    })

    return migrator
}
