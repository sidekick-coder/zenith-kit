import type { LayoutEvents } from "#client/services/LayoutService.ts"
import type { RouterEvents } from "#client/services/RouterService.ts"

export interface EventContract extends RouterEvents, LayoutEvents {
    [key: string]: any
}

export { }
