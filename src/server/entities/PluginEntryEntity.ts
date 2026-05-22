import config from '#server/facades/config.ts'
import container from '#server/facades/container.ts'
import GitBranchRepository from '#server/repositories/GitBranchRepository.ts'
import GitCommitRepository from '#server/repositories/GitCommitRepository.ts'
import ShellService from '#server/services/ShellService.ts'
import Base from '#shared/entities/PluginEntity.ts'
import { composeWith } from '#shared/utils/compose.ts'
import { join } from 'node:path'

export default class PluginEntryEntity extends composeWith(Base) {
    public directory: string

    public makePath(...parts: string[]) {
        return join(this.directory, ...parts)
    }

    public set: typeof config.set = (key, value, source) => {
        config.set(`plugins.registry.${this.id}.${key}`, value, source)
    }

    public get: typeof config.get = (key, defaultValue) => {
        return config.get(`plugins.registry.${this.id}.${key}`, defaultValue)
    }

    public get commits() {
        return new GitCommitRepository({
            cwd: this.directory,
            shell: container.has(ShellService) ? container.get(ShellService) : undefined
        })
    }

    public get branches() {
        return new GitBranchRepository({
            cwd: this.directory,
            shell: container.has(ShellService) ? container.get(ShellService) : undefined
        })
    }
}
