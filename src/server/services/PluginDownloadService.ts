import fs from 'fs'
import path from 'path'
import { dataPath, tmpPath } from '#server/utils/basePath.ts'
import { GitGateway } from '#server/gateways/GitGateway.ts'
import BaseException from '#shared/exceptions/BaseException.ts'
import LoggerService from '#shared/services/LoggerService.ts'
import { readAndParse } from '#server/utils/readAndParse.ts'
import shell from '#server/facades/shell.ts'
import config from '#server/facades/config.ts'

export interface DownloadOptions {
    repository: string
    branch: string
    sshKeyFile?: string
    sshKey?: string
}

export default class PluginDownloadService {
    public logger: LoggerService
    public debug = false

    constructor() {
        this.logger =  new LoggerService()
        this.debug = false
    }

    public setLogger(logger: LoggerService) {
        this.logger = logger
        return this
    }

    public setDebug(debug: boolean) {
        this.debug = debug
        return this
    }

    private async downloadTmp(item: DownloadOptions) {
        const { repository, branch, sshKeyFile, sshKey } = item

        if (!repository) {
            throw new BaseException('repository is required for plugin download')
        }

        const hash = Buffer.from(repository)
            .toString('base64')
            .replace(/=/g, '')

        const dir = tmpPath('plugins', hash)

        const exists = fs.existsSync(dir)

        if (exists && this.debug) {
            this.logger.debug('plugin tmp destination already exists, skipping download', item)
        }

        if (exists) {
            return dir
        }

        const git = await GitGateway.clone(repository, dir, {
            logger: this.logger,
            debug: this.debug,
            branch: branch,
            sshKeyFile: sshKeyFile,
            sshKey: sshKey,
        })

        await git.fetchAll()

        // npm install if package.json exists
        const packageJsonPath = path.join(dir, 'package.json')

        if (fs.existsSync(packageJsonPath)) {
            this.logger.info('installing npm dependencies for plugin', {
                repository,
                branch,
                dir,
            })

            await shell.command('npm', ['install', '--omit=dev'], {
                cwd: dir,
                env: process.env,
            })
        }


        if (this.debug) {
            this.logger.debug('downloaded plugin to tmp', {
                repository,
                branch,
                dir,
            })
        }

        return dir
    }

    public async download(item: DownloadOptions) {
        const dir = await this.downloadTmp(item)

        const configFilename = path.join(dir, 'zenith.config.yml')

        if (!fs.existsSync(configFilename)) {
            throw new BaseException(`Plugin config file not found in repository: ${configFilename}`)
        }

        const conf = await readAndParse(configFilename)

        if (!conf || !conf.id) {
            throw new BaseException(`Plugin config file is invalid or missing 'id' field: ${configFilename}`)
        }

        const destination = dataPath('plugins', conf.id)

        if (fs.existsSync(destination)) {
            throw new BaseException(`Plugin already exists at destination: ${destination}`)
        }

        // move the downloaded plugin to the plugins directory
        fs.cpSync(dir, destination, { recursive: true })
        fs.rmSync(dir, {
            recursive: true,
            force: true
        })

        config.set(`plugins.registry.${conf.id}`, { branch: item.branch || 'main', })

        this.logger.info('plugin downloaded', {
            id: conf.id,
            repository: item.repository,
            destination,
            branch: item.branch || 'main',
        })
    }
}
