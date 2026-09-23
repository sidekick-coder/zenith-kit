import ShellService from "#server/services/ShellService.ts"
import GitCommitEntity from "#shared/entities/GitCommitEntity.ts"

export interface GitCommitRepositoryOptions {
    cwd: string
    shell?: ShellService
}

export interface GitCommitListOptions {
    limit?: number
    offset?: number | null
    branch?: string
}

export interface GitCommitListResult {
    items: GitCommitEntity[]
    limit: number
    total: number
    totalPages: number
    offset: number | null
}

// %H = full hash, %h = short hash, %s = subject, %an = author name, %ae = author email, %aI = author date (ISO 8601), %b = body
const LOG_FORMAT = ['%H', '%h', '%s', '%an', '%ae', '%aI', '%b'].join('%x09')
const COMMIT_SEPARATOR = '---COMMIT---'

export default class GitCommitRepository {
    public cwd: string
    public shell: ShellService

    constructor(options: GitCommitRepositoryOptions) {
        this.cwd = options.cwd
        this.shell = options.shell ?? new ShellService()
    }

    async list(options?: GitCommitListOptions): Promise<GitCommitListResult> {
        const limit = options?.limit ?? 20
        const args = ['log', `--format=${COMMIT_SEPARATOR}%n${LOG_FORMAT}`, `-n`, String(limit)]

        if (options?.branch) {
            args.push(options.branch)
        }

        if (options?.offset) {
            args.push(`--skip=${options.offset}`)
        }

        const output = await this.shell.executeCommandWithOutput('git', args, { cwd: this.cwd })

        const items = output
            .split(COMMIT_SEPARATOR)
            .map((block) => block.trim())
            .filter(Boolean)
            .map((block) => {
                const [hash, shortHash, message, authorName, authorEmail, date, ...bodyParts] =
                    block.split('\t')

                return new GitCommitEntity({
                    hash,
                    short_hash: shortHash,
                    message,
                    author_name: authorName,
                    author_email: authorEmail,
                    date,
                    body: bodyParts.join('\t').trim(),
                })
            })

        const totalOutput = await this.shell.executeCommandWithOutput('git', ['rev-list', '--count', 'HEAD'], { cwd: this.cwd })
        const total = parseInt(totalOutput.trim(), 10)
        const totalPages = Math.ceil(total / limit)

        return {
            items,
            limit,
            total,
            totalPages,
            offset: options?.offset ?? null,
        }
    }

    public async checkout(hash: string): Promise<void> {
        await this.shell.command('git', ['checkout', hash], { cwd: this.cwd })
    }
}
