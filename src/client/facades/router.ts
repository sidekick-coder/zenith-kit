import container from '#client/facades/container.ts'
import type { Router } from '#client/services/RouterService.ts'

const router = container.proxy<Router>('router')

export default router
