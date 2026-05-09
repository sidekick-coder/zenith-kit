import { BaseException } from "#shared/index.ts";
import type { Kysely } from "kysely";

export interface SeederEntiyData {
    name: string;
    source: string | null;
    filename: string;
}

export default class SeederEntity {
    public name: string
    public source: string | null
    public filename: string

    constructor(data: SeederEntiyData) {
        this.name = data.name
        this.source = data.source
        this.filename = data.filename
    }

    public async run(db: Kysely<any>): Promise<void> {
        const mod = await import(this.filename)

        if (typeof mod.default !== 'function') {
            throw new BaseException(`Seeder ${this.name} does not export a function`)
        }

        await mod.default(db)
    }

}

