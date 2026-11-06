import PluginEntity from "#server/entities/PluginEntity.ts";
import { GitGateway } from "#server/gateways/GitGateway.ts";
import { readAndParse } from "#server/utils/readAndParse.ts";
import { BaseException, type LoggerService } from "#shared/index.ts";
import { load } from "js-yaml";
import fs from "node:fs";
import path from "node:path";

export interface FindManyOptions {
    enabled?: boolean
}

export default class PluginRepository {
    public directories = new Set<string>();
    public logger: LoggerService
    public debug: boolean

    public setLogger(logger: LoggerService) {
        this.logger = logger
        return this
    }

    public setDebug(debug: boolean) {
        this.debug = debug
        return this
    }

    public addDirectory(directory: string) {
        this.directories.add(directory);
        return this
    }

    public async instantiate(directory: string): Promise<PluginEntity | null> {

        const pkg = await readAndParse(path.join(directory, 'package.json'))
        const conf = await readAndParse(path.join(directory, 'zenith.config.yml'))
        const clientManifest = await  readAndParse(path.join(directory, 'dist', 'client-browser', '.vite', 'manifest.json'))

        if (!conf.id) {
            this.logger.error(`plugin 'id' in its zenith.config.yml file.`, { directory })
            return null
        }

        const branches: PluginEntity['branches'] = []

        for (const branch of conf.branches || []) {
            if (typeof branch === 'string') {
                branches.push({ branch })
            }

            if (typeof branch === 'object' && branch.branch) {
                branches.push(branch)
            }
        }

        const git = new GitGateway({ cwd: directory })

        if (branches.length === 0) {
            const gitLocalBranches = await git.listBranches()

            for (const branch of gitLocalBranches) {
                if (branch.trim()) {
                    branches.push({ branch: branch.trim() })
                }
            }
        }

        const version = await git.run('rev-parse HEAD').catch(() => 'unknown')

        const plugin = new PluginEntity()

        plugin.id = conf.id
        plugin.name = conf.name || pkg.name || conf.id
        plugin.aliases = conf.aliases || []
        plugin.directory = directory
        plugin.branches = branches
        plugin.version = version
        plugin.enabled = plugin.get('enabled', false)
        plugin.developmentMode = plugin.get('development_mode', false)
        plugin.clientManifest = clientManifest
        plugin.setLogger(this.logger.child({ pluginId: plugin.id }))

        return plugin
    }

    public async findMany(options: FindManyOptions = {}): Promise<PluginEntity[]> {
        const plugins: PluginEntity[] = []

        for (const directory of this.directories) {

            const plugin = await this.instantiate(directory)

            if (plugin) {
                plugins.push(plugin)
            }
        }

        if (options.enabled) {
            return plugins.filter(p => p.enabled)
        }

        return plugins
    }

    public async findById(id: string): Promise<PluginEntity | null> {
        for (const directory of this.directories) {
            const plugin = await this.instantiate(directory)
            
            if (plugin && plugin.id === id) {
                return plugin
            }
        }

        return null
    }

    public async findByIdOrFail(id: string): Promise<PluginEntity> {
        const plugin = await this.findById(id)

        if (!plugin) {
            throw new BaseException(`Plugin with id '${id}' not found.`)
        }

        return plugin
    }
}
