import container from './container'
import { EmmitterService } from '#shared/index.ts'

const emmitter = container.proxy<EmmitterService>(EmmitterService)

export default emmitter
