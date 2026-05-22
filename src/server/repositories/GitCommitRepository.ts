import ShellService from "#server/services/ShellService.ts"
import GitCommitEntity from "#shared/entities/GitCommitEntity.ts"

export interface GitCommitRepositoryOptions {
    cwd: string
    shell?: ShellService
}

export interface GitCommitListOptions {
    limit?: number
    cursor?: string
    branches?: string | string[]
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

    async list(options?: GitCommitListOptions): Promise<GitCommitEntity[]> {
        const limit = options?.limit ?? 20
        const cursor = options?.cursor

        const args = ['log', `--format=${COMMIT_SEPARATOR}%n${LOG_FORMAT}`, `-n`, String(limit)]

        if (cursor) args.push(`${cursor}^`)

        if (options?.branches) {
            const branches = Array.isArray(options.branches) ? options.branches : [options.branches]
            args.push(...branches)
        }

        if (!options?.branches && !cursor) {
            args.push('--all')
        }

        const output = await this.shell.executeCommandWithOutput('git', args, { cwd: this.cwd })

        return output
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
    }
}
