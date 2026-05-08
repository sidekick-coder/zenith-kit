import MigratorService from '#server/services/MigratorService.ts'
import container from './container'

const migrator = container.proxy<MigratorService>(MigratorService)

export default migrator
