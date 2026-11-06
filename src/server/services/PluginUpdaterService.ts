import type PluginEntity from "#server/entities/PluginEntity.ts"
import logger from "#server/facades/logger.ts"
import { GitGateway } from "#server/gateways/GitGateway.ts"
import type { LoggerService } from "#shared/index.ts"

export interface RemoteOptions {
    repository: string
    sshKey?: string
    sshKeyFile?: string
}

export interface BundleOptions {
    filename: string
}

export default class PluginUpdaterService {
    public logger: LoggerService
    public remoteName: string
    public debug = false

    constructor() {
        this.logger = logger
        this.remoteName = 'zenith-update-remote'
    }

    public setLogger(logger: LoggerService) {
        this.logger = logger
        return this
    }

    public setDebug(debug: boolean) {
        this.debug = debug
        return this
    }

    public async setRemote(git: GitGateway, repository: string) {

        const remotes = await git.run('remote -v')

        if (!remotes.includes(this.remoteName)) {
            await git.run(`remote add ${this.remoteName} ${repository}`)
        }

        if (remotes.includes(this.remoteName)) {
            await git.run(`remote set-url ${this.remoteName} ${repository}`)
        }
    }


    private async update(git: GitGateway) {
        const head = await git.run('rev-parse HEAD').then(output => output.trim())

        await git.run(`fetch ${this.remoteName}`)

        const branches = await git.run(`ls-remote --heads ${this.remoteName}`).then(output =>
            output
                .split('\n')
                .map(line => line.split('\t')[1].replace('refs/heads/', ''))
        )

        for (const branch of branches) {
            const hasLocalBranch = await git.run(`rev-parse --verify ${branch}`).then(() => true, () => false)

            if (!hasLocalBranch) {
                await git.run(`checkout -b ${branch} ${this.remoteName}/${branch}`)
            }

            if (hasLocalBranch) {
                await git.run(`checkout ${branch}`)
            }

            await git.run(`pull ${this.remoteName} ${branch}`)
        }

        await git.run(`checkout ${head}`)

    }

    public async remote(plugin: PluginEntity, options: RemoteOptions) {
        const git = new GitGateway({
            cwd: plugin.directory,
            sshKey: options.sshKey,
            sshKeyFile: options.sshKeyFile,
            logger: this.logger,
        })

        await this.setRemote(git, options.repository)

        await this.update(git)
    }

    public async bundle(plugin: PluginEntity, options: BundleOptions) {
        const git = new GitGateway({
            cwd: plugin.directory,
            logger: this.logger,
            debug: true,
        })

        await this.setRemote(git, options.filename)

        await this.update(git)
    }
}

