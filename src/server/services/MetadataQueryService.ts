import type { ExpressionBuilder } from 'kysely'
import type { DatabaseContract as Database } from '#server/contracts/DatabaseContract.ts'

export interface Metadafilter {
    eq?: string,
    neq?: string,
    
    like?: string,
    nlike?: string,

    in?: string[],
    nin?: string[],

    gt?: string,
    gte?: string,
    lt?: string,
    lte?: string,

    is_null?: boolean
    exists?: boolean
}

export interface MetadataQueryPayload {
    [key: string]: string | Metadafilter
}

export default class MetadataQueryService<T extends keyof Database> {
    private payload: MetadataQueryPayload
    private table: T
    private foreignKey: keyof Database[T]
    private parentKey = 'id'

    constructor(payload: MetadataQueryPayload, table: T, foreignKey: keyof Database[T], parentKey?: string) {
        this.payload = payload
        this.table = table
        this.foreignKey = foreignKey

        if (parentKey) {
            this.parentKey = parentKey
        }
    }

    public get needWhereIn(){
        for (const condition of Object.values(this.payload)) {
            if (typeof condition === 'string') {
                return true
            }

            if (
                condition.eq !== undefined
                || condition.neq !== undefined
                || condition.like !== undefined
                || condition.nlike !== undefined
                || condition.in !== undefined
                || condition.nin !== undefined
                || condition.gt !== undefined
                || condition.gte !== undefined
                || condition.lt !== undefined
                || condition.lte !== undefined
                || condition.is_null !== undefined
                || condition.exists === true
            ) {
                return true
            }
        }

        return false
    }

    public get needWhereNotIn(){
        for (const condition of Object.values(this.payload)) {
            if (typeof condition === 'string') continue

            if (condition.exists === false) {
                return true
            }
        }

        return false
    }

    public apply(dbQuery: any) {
        let query = dbQuery

        if (this.needWhereIn) {
            query = query
                .where(this.parentKey, 'in', (eb: any) => 
                    eb.selectFrom(this.table)
                        .select(this.foreignKey)
                        .where(this.whereIn(eb))
                )
        }

        if (this.needWhereNotIn) {
            query = query
                .where(this.parentKey, 'not in', (eb: any) => 
                    eb.selectFrom(this.table)
                        .select(this.foreignKey)
                        .where(this.whereNotIn(eb))
                )
        }

        return query
    }

    private buildRowConditions(eb: ExpressionBuilder<any, any>, name: string, condition: string | Metadafilter) {
        if (typeof condition === 'string') {
            return [
                eb.eb('name', '=', name),
                eb.eb('value', '=', condition)
            ]
        }

        const clauses = [
            eb.eb('name', '=', name)
        ]

        if (condition.eq !== undefined) {
            clauses.push(eb.eb('value', '=', condition.eq))
        }

        if (condition.neq !== undefined) {
            clauses.push(eb.eb('value', '!=', condition.neq))
        }

        if (condition.like !== undefined) {
            clauses.push(eb.eb('value', 'like', condition.like))
        }

        if (condition.nlike !== undefined) {
            clauses.push(eb.eb('value', 'not like', condition.nlike))
        }

        if (condition.in) {
            clauses.push(eb.eb('value', 'in', condition.in))
        }

        if (condition.nin) {
            clauses.push(eb.eb('value', 'not in', condition.nin))
        }

        if (condition.gt !== undefined) {
            clauses.push(eb.eb('value', '>', condition.gt))
        }

        if (condition.gte !== undefined) {
            clauses.push(eb.eb('value', '>=', condition.gte))
        }

        if (condition.lt !== undefined) {
            clauses.push(eb.eb('value', '<', condition.lt))
        }

        if (condition.lte !== undefined) {
            clauses.push(eb.eb('value', '<=', condition.lte))
        }

        if (condition.is_null !== undefined) {
            clauses.push(eb.eb('value', condition.is_null ? 'is' : 'is not', null))
        }

        return clauses
    }

    public whereIn = <DBQuery>(eb:  ExpressionBuilder<any, any>) => {
        let query = eb as any

        for (const [name, condition] of Object.entries(this.payload)) {
            if (typeof condition !== 'string' && condition.exists === false) {
                continue
            }

            query = query.and(this.buildRowConditions(eb, name, condition))
        }

        return query as DBQuery
    }

    public whereNotIn = <DBQuery>(eb:  ExpressionBuilder<any, any>) => {
        let query = eb as any

        for (const [name, condition] of Object.entries(this.payload)) {
            if (typeof condition === 'string') continue

            if (condition.exists === false) {
                query = query('name', '=', name)
            }
        }

        return query as DBQuery
    }
}
