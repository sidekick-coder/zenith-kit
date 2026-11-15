import type { LayoutEvents } from "#client/services/LayoutService.ts"
import type { MenuEvents } from "#client/services/MenuService.ts"
import type { RouterEvents } from "#client/services/RouterService.ts"

export interface EventContract extends RouterEvents, LayoutEvents, MenuEvents {
    [key: string]: any
}

export { }
