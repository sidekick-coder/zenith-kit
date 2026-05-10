import { Command as CommanderCommand } from 'commander'
import chalk from 'chalk'
import { printTable, printObject } from '../utils/printTable.ts'
import { importAll } from '#server/utils/importAll.ts'
import { EmmitterService, LoggerService, tryCatch } from '#shared/index.ts'

export interface CliEvents {
    'cli:before-load': {
        cli: CliService
    }
}

export class CliCommand extends CommanderCommand {
    public __is_cli_command = true
    public table = printTable
    public object = printObject
    public colors = chalk

    public needs: Set<string> = new Set()
    public need(...args: string[]): this {
        args.forEach(arg => this.needs.add(arg))

        return this
    }

    createCommand(name?: string) {
        return new CliCommand(name)
    }
}

export default class CliService extends CliCommand {
    public static __container_entry_key = 'CliService'

    public dirs = new Set<string>()
    public logger = new LoggerService()
    public emmitter = new EmmitterService()
    public debug = false

    public static create(name = 'cli') {
        return new CliService(name)
    }

    public setLogger(logger: LoggerService) {
        this.logger = logger

        return this
    }

    public setDebug(debug: boolean) {
        this.debug = debug

        return this
    }

    public setEmmitter(emmitter: EmmitterService) {
        this.emmitter = emmitter

        return this
    }

    createCommand(name?: string) {
        return new CliService(name)
    }

    public addDir(dir: string) {
        this.dirs.add(dir)

        return this
    }

    public async loadDir(dir: string) {
        const mods = await importAll(dir, {
            onError: ({ error, filename }) => {
                Object.assign(error, { filename })

                this.logger.error(error.message, error)
            }
        })

        for (const [filename, mod] of Object.entries(mods)) {
            if (this.debug) {
                this.logger.debug(`imported file ${filename} from ${dir}`)
            }

            if (!mod.default) {
                this.logger.warn(`file ${mod.filename} does not have a default export, skipping`)
                continue
            }

            if (!mod.default.__is_cli_command) {
                this.logger.warn(`default export of file ${mod.filename} is not a CliCommand, skipping`)
                continue
            }

            const [error] = tryCatch.sync(() => this.addCommand(mod.default))

            if (error) {
                Object.assign(error, { filename: mod.filename })

                this.logger.error(error.message, error)

                continue
            }

            if (this.debug) {
                this.logger.debug(`added command from file ${filename} to cli`)
            }

        }
    }

    public async load() {
        await this.emmitter.emitAndWait('cli:before-load', { cli: this })

        for (const dir of this.dirs) {
            await this.loadDir(dir)
        }

        return this
    }
}
