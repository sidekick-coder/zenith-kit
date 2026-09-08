import container from './container'
import EmmitterService from '#shared/services/EmmitterService.ts'

const emmitter = container.proxy<EmmitterService>(EmmitterService)

export default emmitter
