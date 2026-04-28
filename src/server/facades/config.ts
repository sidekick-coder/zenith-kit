import ConfigService from '#shared/services/ConfigService.ts'
import container from './container'

const config = container.proxy<ConfigService>(ConfigService)

export default config
