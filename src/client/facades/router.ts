import container from '#client/facades/container.ts'
import RouterService from '#client/services/RouterService.ts'

const router = container.proxy<RouterService>(RouterService)

export default router
