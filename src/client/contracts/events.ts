import type { RouterEvents } from "#client/services/RouterService.ts"

export interface EventContract extends RouterEvents {
    [key: string]: any
}

export { }
