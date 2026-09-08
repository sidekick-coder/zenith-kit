import container from './container'
import LifecycleService from '#server/services/LifecycleService.ts'

const lifecycle = container.proxy<LifecycleService>(LifecycleService)

export default lifecycle
