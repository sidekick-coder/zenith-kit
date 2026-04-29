import { Command } from 'commander'
import chalk from 'chalk'
import { printTable, printObject } from '../utils/printTable.ts'

export default class ArtisanService extends Command {
    public needs: Set<string> = new Set()
    public table = printTable
    public object = printObject
    public colors = chalk

    public need(...args: string[]): this {
        args.forEach(arg => this.needs.add(arg))

        return this
    }

    createCommand(name?: string) {
        return new ArtisanService(name)
    }
}
