import BaseRelation from './base.relation.ts'
import type { DatabaseContract as  Database } from '#server/contracts/DatabaseContract.ts'
import db from '#server/facades/database.ts'

interface HasManyThroughOptions {
    table: keyof Database
    tableKey: string
    
    targetTable: keyof Database
    targetKey: string
    
    pivotTable: keyof Database
    pivotSourceKey: string
    pivotTargetKey: string

    property: string
    serialize?: (row: any) => any
    after?: (rows: any[]) => Promise<any>
}

export default class HasManyThrough extends BaseRelation {
    public table: string
    public tableKey: string
    
    public targetTable: string
    public targetKey: string
    
    public pivotTable: string
    public pivotSourceKey: string
    public pivotTargetKey: string

    public property: string
    public serialize: (row: any) => any
    public after: (rows: any[]) => Promise<any>

    constructor(options: HasManyThroughOptions) {
        super()
        this.table = options.table
        this.tableKey = options.tableKey
        
        this.targetTable = options.targetTable
        this.targetKey = options.targetKey
        
        this.pivotTable = options.pivotTable
        this.pivotSourceKey = options.pivotSourceKey
        this.pivotTargetKey = options.pivotTargetKey
        
        this.property = options.property
        this.serialize = options.serialize || ((row: any) => row)
        this.after = options.after || (async (rows: any) => rows)
    }

    async load(entities: any[]) {
        const ids = new Set()

        entities.forEach(e => ids.add(e[this.tableKey]))

        if (!ids.size) return

        const query = db.selectFrom(this.targetTable as any) as any

        const results = await query
            .selectAll(this.targetTable)
            .innerJoin(
                this.pivotTable as any,
                `${this.targetTable}.${this.targetKey}`,
                `${this.pivotTable}.${this.pivotTargetKey}`
            )
            .where(`${this.pivotTable}.${this.pivotSourceKey}`, 'in', Array.from(ids))
            .execute()

        const rows = results.map((r: any) => this.serialize(r))
        
        entities.forEach(e => {
            e[this.property] = rows.filter((r: any) => {
                return r[this.pivotSourceKey] === e[this.tableKey]
            })
        })

        await this.after(entities)
    }
}
