import { join } from 'path'
import { GitGateway } from '#server/gateways/GitGateway.ts'
import { tmpPath } from '#server/utils/basePath.ts'
import Base from '#shared/entities/PluginEntity.ts'
import { composeWith } from '#shared/utils/compose.ts'
import config from '#server/facades/config.ts'
import logger from '#server/facades/logger.ts'
import RouterFileBaseRoutingService from '#server/services/RouterFileBaseRoutingService.ts'
import router from '#server/facades/router.ts'

interface AddApiFolderOptions {
    prefix?: string
}

export default class PluginEntity extends composeWith(Base) {
    public directory: string

    public get git() {
        return new GitGateway({
            cwd: this.directory,
            sshKey: config.get(`modules.${this.id}.ssh_key`),
            sshKeyTmpFileName: tmpPath(`ssh_key_${this.id}.pem`),
            logger: logger.child({ label: 'git' }),
            debug: config.get('git.debug', false),
        })
    }

    public makePath(...parts: string[]) {
        return join(this.directory, ...parts)
    }

    public staticPath(...parts: string[]) {
        return join('/static', 'modules', this.id, ...parts)
    }

    public load() {
        // This method can be used to load additional data from the plugin's directory if needed
    }

    public async addApiFolder(directory: string, options: AddApiFolderOptions = {}) {
        const prefix = options.prefix || `/api/${this.id}`

        await RouterFileBaseRoutingService
            .create(directory)
            .setPrefix(prefix)
            .setRouter(router)
            .setModule(this.id)
            .load()
    }
}
