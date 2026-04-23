import type { GitGateway } from '../gateways/GitGateway.ts'

export interface GitCommitRef {
    name: string
    shortName: string
    type: 'branch' | 'tag' | 'remote' | 'other'
}

export interface GitCommit {
    hash: string
    shortHash: string
    authorName: string
    authorEmail: string
    date: string
    message: string
    refs: GitCommitRef[]
}

export interface GitCommitListOptions {
    branch?: string
    page?: number
    perPage?: number
}

export interface PaginatedCommits {
    items: GitCommit[]
    total: number
    page: number
    perPage: number
    totalPages: number
}

// %D emits the ref decorations for the commit (e.g. "HEAD -> main, tag: v1.0, origin/main")
const LOG_FORMAT = ['%H', '%h', '%an', '%ae', '%aI', '%s', '%D'].join('%x09')

function parseDecorations(decorStr: string): GitCommitRef[] {
    if (!decorStr.trim()) return []

    const refs: GitCommitRef[] = []

    for (const part of decorStr.split(', ')) {
        const trimmed = part.trim()
        if (!trimmed) continue

        if (trimmed.startsWith('HEAD -> ')) {
            const shortName = trimmed.slice(8)
            refs.push({ name: 'HEAD', shortName: 'HEAD', type: 'other' })
            refs.push({ name: `refs/heads/${shortName}`, shortName, type: 'branch' })
        } else if (trimmed.startsWith('tag: ')) {
            const shortName = trimmed.slice(5)
            refs.push({ name: `refs/tags/${shortName}`, shortName, type: 'tag' })
        } else if (trimmed === 'HEAD') {
            refs.push({ name: 'HEAD', shortName: 'HEAD', type: 'other' })
        } else if (trimmed.includes('/')) {
            refs.push({ name: `refs/remotes/${trimmed}`, shortName: trimmed, type: 'remote' })
        } else {
            refs.push({ name: `refs/heads/${trimmed}`, shortName: trimmed, type: 'branch' })
        }
    }

    return refs
}

export class GitCommitRepository {
    constructor(private readonly gateway: GitGateway) {}

    async list(options?: GitCommitListOptions): Promise<PaginatedCommits> {
        const page = options?.page ?? 1
        const perPage = options?.perPage ?? 20
        const ref = options?.branch ?? 'HEAD'

        const output = await this.gateway.run(`log ${ref} --format='${LOG_FORMAT}'`)

        const all: GitCommit[] = output
            .split('\n')
            .filter(Boolean)
            .map((line) => {
                const [hash, shortHash, authorName, authorEmail, date, message, decorStr = ''] = line.split('\t')
                return {
                    hash,
                    shortHash,
                    authorName,
                    authorEmail,
                    date,
                    message,
                    refs: parseDecorations(decorStr),
                }
            })

        const total = all.length
        const totalPages = Math.ceil(total / perPage)
        const start = (page - 1) * perPage
        const items = all.slice(start, start + perPage)

        return { items, total, page, perPage, totalPages }
    }
}
