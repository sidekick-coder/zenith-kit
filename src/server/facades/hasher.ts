
import HasherService from '#server/services/HasherService.ts'
import container from './container.ts'

const hasher = container.proxy<HasherService>(HasherService)

export default hasher

