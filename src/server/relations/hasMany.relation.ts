import type { DatabaseContract as  Database } from '#server/contracts/DatabaseContract.ts'
import db from '#server/facades/database.ts'

interface HasManyOptions {
    table: keyof Database
    tableKey: string
    
    targetTable: keyof Database
    targetKey: string

    property: string
    serialize?: (row: any) => any
    after?: (rows: any[]) => Promise<any>
}

export default class HasMany {
    public table: string
    public tableKey: string
    
    public targetTable: string
    public targetKey: string

    public property: string
    public serialize: (row: any) => any
    public after: (rows: any[]) => Promise<any>

    constructor(options: HasManyOptions) {
        this.table = options.table
        this.tableKey = options.tableKey
        
        this.targetTable = options.targetTable
        this.targetKey = options.targetKey
        
        this.property = options.property
        this.serialize = options.serialize || ((row: any) => row)
        this.after = options.after || (async (rows: any[]) => rows)

    }

    async load(entities: any[]) {
        const ids = new Set()

        entities.forEach(e => ids.add(e[this.tableKey]))
        
        if (!ids.size) return

        const query = db.selectFrom(this.targetTable as any) as any

        // Assumes your models have a standard .list() or .where()
        const results = await query.selectAll()
            .where(this.targetKey, 'in', Array.from(ids))
            .execute()

        const rows = results.map((r: any) => this.serialize(r))
        
        entities.forEach(e => {
            e[this.property] = rows.filter((r: any) => r[this.targetKey] === e[this.tableKey])
        })

        await this.after(rows)
    }
}
