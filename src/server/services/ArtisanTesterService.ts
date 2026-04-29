import ArtisanService from '#server/services/ArtisanService.ts'
import di from '#server/facades/container.ts'

export default class ArteTesterService extends ArtisanService {
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

        di.set(ArtisanService, this)

        return
    }

    public async add(path: string) {
        await import(path)
    }

    public async execute(args: string[]) {
        await this.parseAsync(['node', 'arte', ...args])
    }
}
