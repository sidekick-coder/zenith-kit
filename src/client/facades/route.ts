import container from '#client/facades/container.ts'
import type { RouteLocationNormalizedGeneric } from 'vue-router'

const route = container.proxy<RouteLocationNormalizedGeneric>('route')

export default route

