import type { GitGateway } from '../gateways/GitGateway.ts'

export interface GitBranch {
    name: string
    remote: string | null
    isCurrent: boolean
    isRemote: boolean
}

export interface GitBranchFetchOptions {
    remote: string
    branch: string
    localName?: string
}

export class GitBranchRepository {
    constructor(private readonly gateway: GitGateway) {}

    async list(): Promise<GitBranch[]> {
        const output = await this.gateway.run(
            `branch -a --format='%(HEAD)|%(refname:short)|%(refname)|%(upstream:remotename)'`,
        )

        return output
            .split('\n')
            .filter(Boolean)
            .filter(line => line.includes('|'))
            .map((line) => {
                const [head, refShort, refFull, remoteName] = line.split('|')

                const isRemote = refFull.startsWith('refs/remotes/')
                const name = refShort

                return {
                    name,
                    remote: isRemote ? name.split('/')[0] : (remoteName || null),
                    isCurrent: head === '*',
                    isRemote,
                }
            })
    }

    async fetch(options: GitBranchFetchOptions): Promise<void> {
        const { remote, branch, localName } = options
        const local = localName ?? branch

        await this.gateway.run(`fetch ${remote} ${branch}:${local}`)
    }
}
