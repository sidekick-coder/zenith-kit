import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { writeFile, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

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
}

function escapeShellArgument(value: string): string {
    return `'${value.replace(/'/g, `'\\''`)}'`
}

export class GitGateway {
    private readonly cwd: string
    private readonly sshKey?: string
    private readonly sshKeyFile?: string
    private readonly sshKeyTmpFileName?: string

    constructor({ cwd, sshKey, sshKeyFile, sshKeyTmpFileName }: GitGatewayOptions) {
        this.cwd = cwd
        this.sshKey = sshKey
        this.sshKeyFile = sshKeyFile
        this.sshKeyTmpFileName = sshKeyTmpFileName
    }

    private async buildEnv(): Promise<{ env: NodeJS.ProcessEnv; cleanup: () => Promise<void> }> {
        if (this.sshKeyFile) {
            return {
                env: {
                    ...process.env,
                    GIT_SSH_COMMAND: `ssh -i ${escapeShellArgument(this.sshKeyFile)} -o StrictHostKeyChecking=no`,
                },
                cleanup: async () => {},
            }
        }

        if (this.sshKey) {
            const tempFile = this.sshKeyTmpFileName ?? join(tmpdir(), `git-ssh-key-${randomUUID()}`)

            await writeFile(tempFile, this.sshKey, { mode: 0o600 })

            return {
                env: {
                    ...process.env,
                    GIT_SSH_COMMAND: `ssh -i ${escapeShellArgument(tempFile)} -o StrictHostKeyChecking=no`,
                },
                cleanup: async () => {
                    await unlink(tempFile).catch(() => {})
                },
            }
        }

        return { env: process.env, cleanup: async () => {} }
    }

    async run(args: string): Promise<string> {
        const { env, cleanup } = await this.buildEnv()
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
