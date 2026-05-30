import type PageRequestContextEntity from "#server/entities/PageRequestContextEntity.ts"
import type { UserRepositoryEvents } from "#server/repositories/UserRepository.ts"
import type { CliEvents } from "#server/services/CliService.ts"
import type { MigratorServiceEvents } from "#server/services/MigratorService.ts"
import type { RouterEvents } from "#server/services/RouterService.ts"
import type { SchedulerEvents } from "#server/services/SchedulerService.ts"
import type { SeederEvents } from "#server/services/SeederService.ts"

export interface EventContract extends SeederEvents, RouterEvents, CliEvents, SchedulerEvents, MigratorServiceEvents, UserRepositoryEvents {
    // page request
    'page:request:start': PageRequestContextEntity
    'page:request:before-render': PageRequestContextEntity
    'page:request:after-render': PageRequestContextEntity

    [key: string]: any
}

export { }
