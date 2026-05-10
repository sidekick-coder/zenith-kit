import { join } from 'path'
import RouterFileBaseRoutingService from '#server/services/RouterFileBaseRoutingService.ts'
import router from '#server/facades/router.ts'
import PluginEntryEntity from './PluginEntryEntity.ts'
import emmitter from '#server/facades/emmitter.ts'

interface AddApiFolderOptions {
    prefix?: string
}

export default class PluginEntity extends PluginEntryEntity {
    public staticPath(...parts: string[]) {
        return join('/static', 'modules', this.id, ...parts)
    }

    public async load() {
        // This method can be used to load additional data from the plugin's directory if needed
    }

    public async addApiFolder(directory: string, options: AddApiFolderOptions = {}) {
        emmitter.on('router:registered', async () => {
            const prefix = options.prefix || `/api/${this.id}`

            await RouterFileBaseRoutingService
                .create(directory)
                .setPrefix(prefix)
                .setRouter(router)
                .setModule(this.id)
                .load()
        })
    }

    public static fromPluginDiscoverEntity<T>(this: new () => T, entity: PluginEntryEntity): T {
        const contructor = (typeof this === 'function' ? this : PluginEntity) as any

        const instance = new contructor() as any

        let payload = {
            id: entity.id,
            name: entity.name,
            version: entity.version,
            directory: entity.directory,
        }

        if (typeof contructor?.parse === 'function') {
            payload = (contructor as any).parse(entity)
        }

        if (typeof (this as any)?.parse === 'function') {
            payload = (this as any).parse(entity)
        }

        Object.assign(instance as any, payload)

        return instance
    }


}
