import CliService from '#server/services/CliService.ts'
import di from '#server/facades/container.ts'

export default class ArteTesterService extends CliService {
    constructor() {
        super() 

        this.exitOverride()

        this.configureOutput({
            writeOut: () => {
                // Suppress command output during tests
            },
            writeErr: () => {
                // Suppress error output during tests
            },
        })

        di.set(CliService, this)

        return
    }

    public async add(path: string) {
        await import(path)
    }

    public async execute(args: string[]) {
        await this.parseAsync(['node', 'arte', ...args])
    }
}
