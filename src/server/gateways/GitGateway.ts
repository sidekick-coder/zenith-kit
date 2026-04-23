import { exec } from 'node:child_process'
import { promisify } from 'node:util'

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
}

function escapeShellArgument(value: string): string {
    return `'${value.replace(/'/g, `'\\''`)}'`
}

export class GitGateway {
    private readonly cwd: string
    private readonly env?: NodeJS.ProcessEnv

    constructor({ cwd, sshKey }: GitGatewayOptions) {
        this.cwd = cwd
        this.env = sshKey
            ? {
                ...process.env,
                GIT_SSH_COMMAND: `ssh -i ${escapeShellArgument(sshKey)} -o StrictHostKeyChecking=no`,
            }
            : undefined
    }

    async run(args: string): Promise<string> {
        const { stdout } = await execAsync(`git ${args}`, {
            cwd: this.cwd,
            env: this.env,
        })
        return stdout.trim()
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
