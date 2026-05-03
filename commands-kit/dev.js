import { Command } from 'commander'

const command = new Command('dev')

command
    .description('Start development server with watch mode')
    .action(async () => {
        console.log('Starting development server with watch mode...')
    })

export default command

