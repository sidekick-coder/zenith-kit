import BaseRelation from './base.relation.ts'
import db from '#server/facades/database.ts'

interface BelongsToOptions {
    table: string
    tableKey: string
    
    targetTable: string
    targetKey: string

    property: string
    serialize?: (row: any) => any
}

export default class BelongsTo extends BaseRelation {
    public table: string
    public tableKey: string
    
    public targetTable: string
    public targetKey: string

    public property: string
    public serialize: (row: any) => any

    constructor(options: BelongsToOptions) {
        super()
        this.table = options.table
        this.tableKey = options.tableKey
        
        this.targetTable = options.targetTable
        this.targetKey = options.targetKey
        
        this.property = options.property
        this.serialize = options.serialize || ((row: any) => row)
    }

    async load(entities: any[]) {
        const ids = [...new Set(entities.map(e => e[this.targetKey]).filter(Boolean))]
        
        if (!ids.length) return

        const query = db.selectFrom(this.targetTable as any) as any

        // Assumes your models have a standard .list() or .where()
        const results = await query.selectAll()
            .where(this.tableKey, 'in', ids)
            .execute()

        const rows = results.map((r: any) => this.serialize(r))

        const map = new Map(rows.map((r: any) => [r[this.tableKey], r]))
        
        entities.forEach(e => {
            e[this.property] = map.get(e[this.targetKey]) || null
        })
    }
}
