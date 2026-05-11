import { auto } from '#client/services/RouterService.ts'
import type { AutoOptions } from '#client/services/RouterService.ts'
import type { DefineComponent } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

/** @deprecated Use auto from RouterService instead */
export function autoRoutes(
    imports: Record<string, DefineComponent | (() => Promise<DefineComponent>)>,
    options: AutoOptions = {}
): RouteRecordRaw[] {
    return auto(imports, options)
}
