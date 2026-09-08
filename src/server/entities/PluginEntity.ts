import { join } from 'path'
import PluginEntryEntity from './PluginEntryEntity.ts'

interface AddApiFolderOptions {
    prefix?: string
}

export default class PluginEntity extends PluginEntryEntity {
    public apiFolders = new Map<string, AddApiFolderOptions>()
    public apiDirectories = new Set<string>()

    constructor() {
        super()
    }

    public staticPath(...parts: string[]) {
        return join('/static', 'modules', this.id, ...parts)
    }

    public async load() {
        // This method can be used to load additional data from the plugin's directory if needed
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
