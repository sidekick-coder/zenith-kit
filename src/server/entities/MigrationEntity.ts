import { BaseException } from "#shared/index.ts";
import type { Kysely } from "kysely";

export interface MigrationEntiyData {
    name: string;
    source: string | null;
    filename: string;
    executedAt: Date | null;
}

export default class MigrationEntity {
    public name: string
    public source: string | null
    public filename: string
    public executedAt: Date | null

    constructor(data: MigrationEntiyData) {
        this.name = data.name
        this.source = data.source
        this.filename = data.filename
        this.executedAt = data.executedAt
    }

    public async up(db: Kysely<any>): Promise<void> {
        const mod = await import(this.filename)

        if (typeof mod.up !== 'function') {
            throw new BaseException(`Migration ${this.name} does not export an up function`)
        }

        await mod.up(db)
    }

    public async down(db: Kysely<any>): Promise<void> {
        const mod = await import(this.filename)

        if (typeof mod.down !== 'function') {
            throw new BaseException(`Migration ${this.name} does not export a down function`)
        }

        await mod.down(db)
    }
}

