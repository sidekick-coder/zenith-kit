import LoggerService from '#shared/services/LoggerService.ts'
import container from './container'

const logger = container.proxy<LoggerService>(LoggerService)

export default logger
