import Base from '#shared/entities/PluginEntity.ts'
import router from '#client/facades/router.ts'
import { composeWith } from '#shared/utils/compose.ts'
import type { AutoOptions } from '#client/services/RouterService.ts'

export default class PluginEntity extends composeWith(Base) {
    public addPagesFolder(imports: any, options?: AutoOptions) {
        router.auto(imports, options)
    }
}
