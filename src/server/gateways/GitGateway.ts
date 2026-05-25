import { writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import LoggerService from '../../shared/services/LoggerService.ts'
import { tmpPath } from '#server/utils/basePath.ts'
import { tryCatch } from '#shared/index.ts'
import ShellService from '#server/services/ShellService.ts'

export interface GitRepoInfo {
    directory: string
    head: string | null
    shortHash: string
    isDetachedHead: boolean
    remotes: string[]
}

export interface GitGatewayOptions {
    cwd: string
    sshKey?: string
    sshKeyFile?: string
    logger?: LoggerService
    shell?: ShellService
    debug?: boolean
}

interface GitGatewayExecuteOptions {
    args: string
    cwd?: string
    sshKey?: string
    sshKeyFile?: string
    logger?: LoggerService
    shell?: ShellService
    debug?: boolean
}

export class GitGateway {
    private readonly cwd: string
    private readonly sshKey?: string
    private readonly sshKeyFile?: string
    private readonly logger: LoggerService = new LoggerService()
    private readonly debug: boolean
    private readonly shell: ShellService

    constructor(options: GitGatewayOptions) {
        this.cwd = options.cwd
        this.sshKey = options.sshKey
        this.sshKeyFile = options.sshKeyFile
        this.logger = options.logger ?? new LoggerService()
        this.shell = options.shell ?? new ShellService({ logger: this.logger, debug: options.debug })
        this.debug = options.debug ?? false
    }

    public static async execute(options: GitGatewayExecuteOptions): Promise<string> {
        const cwd = options.cwd
        const sshKey = options.sshKey
        const sshKeyFile = options.sshKeyFile
        const logger = options.logger ?? new LoggerService()
        const debug = options.debug ?? false
        const args = options.args
        const shell = options.shell ?? new ShellService({ logger, debug })

        const env: Record<string, string> = { }

        if (sshKeyFile) {
            env.GIT_SSH_COMMAND = `ssh -i ${sshKeyFile} -o StrictHostKeyChecking=no`
        }

        if (sshKey) {
            const tempFile = tmpPath('git-clone-ssh-key-' + randomUUID())

            await writeFile(tempFile, sshKey, { mode: 0o600 })

            env.GIT_SSH_COMMAND = `ssh -i ${tempFile} -o StrictHostKeyChecking=no`
        }

        const command = `git ${args}`

        if (debug) {
            logger.debug(command, {
                cwd: cwd,
                sshKeyFile,
            })
        }

        return shell.executeCommandWithOutput('git', args.split(' '), {
            cwd: cwd,
            env: {
                ...process.env,
                ...env,
            },
        })
    }

    public static async clone(repoUrl: string, targetDir: string, options: Omit<GitGatewayOptions, 'cwd'>) {
        await GitGateway.execute({
            sshKey: options.sshKey,
            sshKeyFile: options.sshKeyFile,
            logger: options.logger,
            debug: options.debug,
            shell: options.shell,
            args: `clone '${repoUrl}' '${targetDir}'`,
        })

        return new GitGateway({ ...options, cwd: targetDir })
    }


    async run(args: string): Promise<string> {
        return await GitGateway.execute({
            cwd: this.cwd,
            sshKey: this.sshKey,
            sshKeyFile: this.sshKeyFile,
            logger: this.logger,
            debug: this.debug,
            shell: this.shell,
            args,
        })
    }

    async tryRun(args: string): Promise<string | null> {
        const [error, response] = await tryCatch(() => this.run(args))

        if (error) {
            this.logger.error(error)
            return null
        }

        return response
    }

    async checkout(ref: string) {
        return this.run(`checkout ${ref}`)
    }

    async fetchAll() {
        return this.run('fetch --all --prune')
    }

    async pull(): Promise<void> {
        await this.fetchAll()

        const upstream = await this.tryRun('rev-parse --abbrev-ref --symbolic-full-name @{upstream}')

        if (upstream) {
            await this.run(`pull --ff-only`)
        }
    }

    async getInfo(): Promise<GitRepoInfo> {
        const head = await this.run('rev-parse --abbrev-ref HEAD')
        const isDetachedHead = head === 'HEAD'

        const shortHash = await this.run('rev-parse --short HEAD')

        const remotesOutput = await this.tryRun('remote')

        const remotes = remotesOutput
            ? remotesOutput.split('\n').filter(Boolean)
            : []

        return {
            directory: this.cwd,
            head: isDetachedHead ? null : head,
            shortHash,
            isDetachedHead,
            remotes,
        }
    }
}
