import ShellService from "#server/services/ShellService.ts"
import GitBranchEntity from "#shared/entities/GitBranchEntity.ts"

export interface GitBranchRepositoryOptions {
    cwd: string
    shell?: ShellService
}

export default class GitBranchRepository {
    public cwd: string
    public shell: ShellService

    constructor(options: GitBranchRepositoryOptions) {
        this.cwd = options.cwd
        this.shell = options.shell ?? new ShellService()
    }

    async list(): Promise<GitBranchEntity[]> {
        const output = await this.shell.executeCommandWithOutput(
            'git',
            ['branch', '-a', `--format=%(HEAD)|%(refname:short)|%(refname)|%(upstream:remotename)`],
            { cwd: this.cwd },
        )

        return output
            .split('\n')
            .filter(Boolean)
            .filter((line) => line.includes('|'))
            .map((line) => {
                const [head, refShort, refFull, remoteName] = line.split('|')

                const isRemote = refFull.startsWith('refs/remotes/')

                return new GitBranchEntity({
                    name: refShort,
                    remote: isRemote ? refShort.split('/')[0] : remoteName || null,
                    is_current: head === '*',
                    is_remote: isRemote,
                })
            })
    }

    async fetch(options: { remote: string; branch: string; localName?: string }): Promise<void> {
        const { remote, branch, localName = branch } = options

        await this.shell.command('git', ['fetch', remote, `${branch}:${localName}`], { cwd: this.cwd })
    }
}
