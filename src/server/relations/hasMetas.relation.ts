import { set } from 'lodash-es'
import type { DatabaseContract as  Database } from '#server/contracts/DatabaseContract.ts'
import db from '#server/facades/database.ts'
import MetadataService from '#server/services/MetadataService.ts'

interface HasMetasOptions {
    table: keyof Database
    tableKey: string
    
    targetTable: keyof Database
    targetKey: string

    property: string
}

export default class HasMetas {
    public table: string
    public tableKey: string
    
    public targetTable: string
    public targetKey: string

    public property: string

    constructor(options: HasMetasOptions) {
        this.table = options.table
        this.tableKey = options.tableKey
        
        this.targetTable = options.targetTable
        this.targetKey = options.targetKey
        
        this.property = options.property
    }

    async load(entities: any[]) {
        const ids = new Set()

        entities.forEach(e => ids.add(e[this.tableKey]))
        
        if (!ids.size) return

        let query = db.selectFrom(this.targetTable as any) as any

        query = query.selectAll().where(this.targetKey, 'in', Array.from(ids))

        // Assumes your models have a standard .list() or .where()
        const results = await query.execute()
            
        entities.forEach(e => {
            const rows = results.filter((r: any) => r[this.targetKey] === e[this.tableKey])
            
            set(e, this.property, MetadataService.flatten(rows))
        })

    }
}
