import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { writeFile, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import LoggerService from '../../shared/services/LoggerService.ts'

const execAsync = promisify(exec)

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
    sshKeyTmpFileName?: string
    logger?: LoggerService
    debug?: boolean
}

function escapeShellArgument(value: string): string {
    return `'${value.replace(/'/g, `'\\''`)}'`
}

export class GitGateway {
    private readonly cwd: string
    private readonly sshKey?: string
    private readonly sshKeyFile?: string
    private readonly sshKeyTmpFileName?: string
    private readonly logger: LoggerService = new LoggerService()
    private readonly debug: boolean

    constructor(options: GitGatewayOptions) {
        Object.assign(this, options)
    }

    private async buildEnv() {
        const result = {
            sshKeyFile: undefined as string | undefined,
            env: process.env,
            cleanup: async () => { },
        }

        if (this.sshKeyFile) {
            result.env.GIT_SSH_COMMAND = `ssh -i ${escapeShellArgument(this.sshKeyFile)} -o StrictHostKeyChecking=no`
            result.sshKeyFile = this.sshKeyFile
        }

        if (this.sshKey) {
            const tempFile = this.sshKeyTmpFileName ?? join(tmpdir(), `git-ssh-key-${randomUUID()}`)

            await writeFile(tempFile, this.sshKey, { mode: 0o600 })

            result.env.GIT_SSH_COMMAND = `ssh -i ${escapeShellArgument(tempFile)} -o StrictHostKeyChecking=no`
            result.sshKeyFile = tempFile
            result.cleanup = async () => {
                try {
                    await unlink(tempFile)
                } catch (err) {
                    this.logger.warn(`Failed to delete temporary SSH key file: ${tempFile}`, { error: err })
                }
            }
        }

        return result
    }

    async run(args: string): Promise<string> {

        const { env, sshKeyFile, cleanup } = await this.buildEnv()

        if (this.debug) {
            this.logger.debug('git ' + args, {
                cwd: this.cwd,
                sshKeyFile,
            })
        }

        try {
            const { stdout } = await execAsync(`git ${args}`, {
                cwd: this.cwd,
                env,
            })
            return stdout.trim()
        } finally {
            await cleanup()
        }
    }

    async tryRun(args: string): Promise<string | null> {
        try {
            return await this.run(args)
        } catch {
            return null
        }
    }

    async checkout(ref: string): Promise<void> {
        await this.run(`checkout ${ref}`)
    }

    async fetch(): Promise<void> {
        await this.run('fetch --all --prune')
    }

    async pull(): Promise<void> {
        await this.fetch()

        const upstream = await this.tryRun('rev-parse --abbrev-ref --symbolic-full-name @{upstream}')

        if (upstream) {
            await this.run('pull --ff-only')
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
