import container from './container.ts'
import EmmitterService from '#shared/services/EmmitterService.ts'

const emmitter = container.proxy<EmmitterService>(EmmitterService)

export default emmitter

