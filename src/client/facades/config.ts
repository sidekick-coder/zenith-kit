import ConfigService from '#shared/services/ConfigService.ts'
import container from './container'

const config = container.proxy<ConfigService>(ConfigService)

// if (import.meta.env.DEV) {
//     globalThis.config = config
// }

export default config
