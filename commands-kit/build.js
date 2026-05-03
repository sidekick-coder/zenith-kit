import { Command } from 'commander'

const command = new Command('build')

command
    .description('Build plugin for production')
    .action(async () => {
        console.log('Building plugin for production...')
    })

export default command

