import type { HttpContext } from '#server/contracts/HttpContextContract.ts'
import RouterService from '#server/services/RouterService.ts'
import container from '#server/facades/container.ts'

const router = container.proxy<RouterService<HttpContext>>(RouterService)

export default router
