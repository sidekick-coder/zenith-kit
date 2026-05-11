import { join } from 'path'
import RouterFileBaseRoutingService from '#server/services/RouterFileBaseRoutingService.ts'
import PluginEntryEntity from './PluginEntryEntity.ts'
import emmitter from '#server/facades/emmitter.ts'
import type { RouterEvents } from '#server/services/RouterService.ts'
import type RouterRegister from '#server/services/RouterRegisterService.ts'

interface AddApiFolderOptions {
    prefix?: string
}

export default class PluginEntity extends PluginEntryEntity {
    public apiFolders = new Map<string, AddApiFolderOptions>()
    public apiDirectories = new Set<string>()

    constructor() {
        super()

        emmitter.on('router:registered', this.onRouterRegistered.bind(this))
    }

    public staticPath(...parts: string[]) {
        return join('/static', 'modules', this.id, ...parts)
    }

    public async load() {
        // This method can be used to load additional data from the plugin's directory if needed
    }

    public async onRouterRegistered(ctx: RouterEvents['router:registered']) {
        const router = ctx.router as RouterRegister

        for (const [directory, options] of this.apiFolders) {
            const prefix = options.prefix || `/api/`

            await RouterFileBaseRoutingService
                .create(directory)
                .setPrefix(prefix)
                .setRouter(router)
                .setModule(this.id)
                .load()
        }

        for (const apiDir of this.apiDirectories) {
            router.addDir(apiDir, {
                module: this.id,
            })
        }
    }

    public addApiFolder(directory: string, options: AddApiFolderOptions = {}) {
        this.apiFolders.set(directory, options)
    }

    public addRouterFolder(directory: string) {
        this.apiDirectories.add(directory)
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
