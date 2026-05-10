import db from '#server/facades/database.ts'

export default class MetadataService {
    public id: number
    public table: string
    public foreignKey: string

    constructor(payload: Pick<MetadataService, 'table' | 'foreignKey' | 'id'>) {
        this.id = payload.id
        this.table = payload.table
        this.foreignKey = payload.foreignKey
    }

    public static parse(value: any): any {
        if (typeof value === 'string' && value.startsWith('json:')) {
            return JSON.parse(value.slice(5))
        }

        if (typeof value === 'string' && value.startsWith('bool:')) {
            return value.slice(5) === 'true'
        }

        if (typeof value === 'string' && value.startsWith('number:')) {
            return Number(value.slice(7))
        }
        
        if (typeof value === 'string' && value.startsWith('string:')) {
            return value.slice(7)
        }

        return value
    }

    public static flatten(items: Array<{ name: string; value: any }>): Record<string, any> {
        const result: Record<string, any> = {}

        for (const item of items) {
            result[item.name] = MetadataService.parse(item.value)
        }

        return result
    }
    

    public async get<T = any>(name: string): Promise<T | undefined>
    public async get<T = any>(name: string, defaultValue: T): Promise<T>
    public async get<T = any>(name: string, defaultValue?: T): Promise<T | undefined> {
        let query = db.selectFrom(this.table as any) as any

        query = query
            .selectAll()
            .where((this.foreignKey as string), '=', this.id)
            .where('name', '=', name)
            .limit(1)

        const row = await query.executeTakeFirst() 

        if (!row || !row.value) {
            return defaultValue
        }

        const value = MetadataService.parse(row.value)

        return value as T
    }

    public async set(name: string, value: any): Promise<void> {
        const foreignKey = this.foreignKey
        const table = this.table

        const values = {
            [foreignKey]: this.id,
            name,
            value
        }

        if (typeof value === 'object') {
            values.value = `json:${JSON.stringify(value)}`
        }

        const row = await db.selectFrom(table as any).where((foreignKey as string), '=', this.id).where('name', '=', name).executeTakeFirst()

        if (row) {
            await db.updateTable(table as any)
                .set(values)
                .where((foreignKey as string), '=', this.id)
                .where('name', '=', name)
                .execute()

            return
        }

        await db.insertInto(table as any)
            .values(values)
            .execute()

    }

    public async list(): Promise<Array<{ name: string; value: any }>> {
        const foreignKey = this.foreignKey
        const table = this.table

        let query = db.selectFrom(table as any) as any

        query = query
            .selectAll()
            .where((foreignKey as string), '=', this.id)

        const rows = await query.execute()

        return rows.map((row: any) => ({
            name: row.name,
            value: MetadataService.parse(row.value)
        }))
    }

    public async all(): Promise<Record<string, any>> {
        const rows = await this.list()
        const result: Record<string, any> = {}

        for (const row of rows) {
            result[row.name] = row.value
        }

        return result
    }

}
