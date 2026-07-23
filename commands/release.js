import { Command } from 'commander'
import { execSync, spawnSync } from 'child_process'
import readline from 'readline'

function exec(cmd) {
    return execSync(cmd, { encoding: 'utf-8' }).trim()
}

function run(cmd, args = []) {
    const result = spawnSync(cmd, args, { stdio: 'inherit' })

    if (result.status !== 0) {
        process.exit(result.status ?? 1)
    }
}

function ask(question, choices) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

        const list = choices.map((c, i) => `  ${i + 1}) ${c}`).join('\n')

        rl.question(`${question}\n${list}\n> `, (answer) => {
            rl.close()
            const index = parseInt(answer, 10) - 1

            if (index >= 0 && index < choices.length) {
                resolve(choices[index])
            } else {
                console.error('Invalid choice.')
                process.exit(1)
            }
        })
    })
}

const command = new Command('release')

command
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

        if (options.patch) bump = 'patch'
        else if (options.minor) bump = 'minor'
        else if (options.major) bump = 'major'
        else bump = await ask('Select version bump type:', ['patch', 'minor', 'major'])

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

export default command
