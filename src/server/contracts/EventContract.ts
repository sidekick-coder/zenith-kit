import type MigrationEntity from "#server/entities/MigrationEntity.ts"
import type PageRequestContextEntity from "#server/entities/PageRequestContextEntity.ts"
import type { CliEvents } from "#server/services/CliService.ts"
import type { RouterEvents } from "#server/services/RouterService.ts"
import type { SeederEvents} from "#server/services/SeederService.ts"
import type { UserEntity } from "#shared/index.ts"

export interface EventContract extends SeederEvents, RouterEvents, CliEvents {

    // migrator
    'migrator:before-migrate': {
        migrations: MigrationEntity[]
    }
    'migrator:after-migrate': {
        migrations: MigrationEntity[]
    }
    'migrator:before-rollback': {
        migrations: MigrationEntity[]
    }
    'migrator:after-rollback': {
        migrations: MigrationEntity[]
    }
    // user
    'user:before-create': { user: UserEntity }
    'user:after-create': { user: UserEntity }
    'user:before-update': { user: UserEntity }
    'user:after-update': { user: UserEntity }
    'user:before-delete': { user: UserEntity }
    'user:after-delete': { user: UserEntity }

    // page request
    'page:request:start': PageRequestContextEntity
    'page:request:before-render': PageRequestContextEntity
    'page:request:after-render': PageRequestContextEntity

    [key: string]: any
}

export { }
