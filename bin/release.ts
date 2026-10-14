import { program } from 'commander'
import { execSync, spawnSync } from 'child_process'
import { select } from '@inquirer/prompts'

function exec(cmd: string) {
    return execSync(cmd, { encoding: 'utf-8' }).trim()
}

function run(cmd: string, args: string[] = []) {
    const result = spawnSync(cmd, args, { stdio: 'inherit' })

    if (result.status !== 0) {
        process.exit(result.status ?? 1)
    }
}

program
    .description('Bump version, publish to npm and push to origin')
    .option('--patch', 'Bump patch version')
    .option('--minor', 'Bump minor version')
    .option('--major', 'Bump major version')
    .action(async (options) => {
        const staged = exec('git diff --cached --name-only')
        const unstaged = exec('git diff --name-only')

        if (staged || unstaged) {
            console.error('Error: there are uncommitted changes. Please commit or stash them before releasing.')
            process.exit(1)
        }

        let bump
        if (options.patch) {
            bump = 'patch'
        }

        if (options.minor) {
            bump = 'minor'
        }

        if (options.major) {
            bump = 'major'
        }

        if (!bump) {
            bump = await select({
                message: 'Select version bump type:',
                choices: [
                    {
                        name: 'Patch',
                        value: 'patch'
                    },
                    {
                        name: 'Minor',
                        value: 'minor'
                    },
                    {
                        name: 'Major',
                        value: 'major'
                    }
                ]
            })
        }

        console.log(`run tests before bumping version...`)
        run('npm', ['test'])

        console.log(`\nBumping ${bump} version...`)
        run('npm', ['version', bump])

        console.log('\nBuilding...')
        run('npm', ['run', 'build'])

        console.log('\nPublishing to npm...')
        run('npm', ['publish'])

        console.log('\nPushing commit and tag to origin...')
        run('git', ['push', '--follow-tags'])

        console.log('\nRelease complete.')
    })

program.parse(process.argv)
