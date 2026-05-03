import Base from '#shared/entities/PluginEntity.ts'
import { composeWith } from '#shared/utils/compose.ts'
import { join } from 'node:path'

export default class PluginDiscoverEntity extends composeWith(Base) {
    public directory: string

    public makePath(...parts: string[]) {
        return join(this.directory, ...parts)
    }
}
