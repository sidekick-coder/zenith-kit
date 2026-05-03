import { Command } from 'commander'

const command = new Command('start')

command
    .description('Start server in production mode')
    .action(async () => {
        console.log('Start production...')
    })

export default command

