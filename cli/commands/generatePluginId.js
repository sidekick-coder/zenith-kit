import { Command } from 'commander'
import { ulid } from 'ulid'

const command = new Command('ulid')

command
    .description('Generate a unique plugin ID to be added to zenith.config.yml file')
    .action(async () => {
        const id = ulid()

        console.log(id)
    })

export default command



