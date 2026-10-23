import container from './container.ts'
import EmmitterService from '#shared/services/EmmitterService.ts'
import type { EventContract } from '#client/contracts/events.ts'

const emmitter = container.proxy<EmmitterService<EventContract>>(EmmitterService)

export default emmitter
