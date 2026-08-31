import { CliCommand } from '#server/services/CliService.ts'
import { ulid } from 'ulid'

const command = new CliCommand('plugin:generate-id')

command
    .helpGroup('plugins')
    .description('Generate a unique plugin ID to be added to zenith.config.yml file')
    .action(async () => {
        const id = ulid()

        console.log(id)
    })

export default command



