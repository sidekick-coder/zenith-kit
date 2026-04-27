import type { ExpressionBuilder, ExpressionWrapper, Selectable } from 'kysely'
import type { SelectFrom } from './common.ts'
import { list } from './list.ts'
import { count } from './count.ts'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'
import Pagination from '#shared/entities/pagination.entity.ts'

export interface PaginateOptions<T extends keyof Database> {
    debug?: boolean
    page?: number
    limit?: number
    orderBy?: Database[T] | (keyof Database[T])[] 
    orderDesc?: ('asc' | 'desc') | ('asc' | 'desc')[]
    where?: (qb: ExpressionBuilder<Database, T>) => ExpressionWrapper<Database, T, any>
    serialize?: (row: Selectable<Database[T]>) => any
    query?: (qb: SelectFrom<T>) => any
}

export type PaginateResult<T extends keyof Database, O extends PaginateOptions<T> | undefined> =
    O extends undefined ? Selectable<Database[T]> :
    O extends { serialize: (row: Selectable<Database[T]>) => infer R } ? R : Selectable<Database[T]>

export async function paginate<T extends keyof Database, O extends PaginateOptions<T>>(table: T, options?: O) {
    const page = options?.page && options.page > 0 ? options.page : 1
    const limit = options?.limit && options.limit > 0 ? options.limit : 10
    const offset = (page - 1) * limit
    const orderBy = options?.orderBy && (Array.isArray(options.orderBy) ? options.orderBy : [options.orderBy])
    const orderDesc = options?.orderDesc && (Array.isArray(options.orderDesc) ? options.orderDesc : [options.orderDesc])
    
    const items = await list(table, { 
        serialize: options?.serialize,  
        query: () => {
            let query: any = db.selectFrom(table).selectAll()

            if (options?.query) {
                query = options.query(db.selectFrom(table))
            }

            if (options?.where) {
                query = query.where((eb: any) => options.where!(eb)) as any
            }

            if (orderBy) {
                orderBy
                    .map((col, i) => [col, orderDesc && orderDesc[i] ? orderDesc[i] : 'asc'] as const)
                    .forEach(([col, direction]) => {
                        query = query.orderBy(col as string, direction)
                    })
            }

            if (limit > 0) {
                query = query.limit(limit).offset(offset)
            }

            

            if (options?.debug) {
                console.log(query.compile())
            }

            return query
        }
    })

    const total = await count(table, {
        query: () => {
            let query: any = db.selectFrom(table).selectAll()

            if (options?.query) {
                query = options.query(db.selectFrom(table))
            }

            if (options?.debug) {
                console.log(query.compile())
            }

            return query
        }
    })

    return Pagination.from<PaginateResult<T, O>>({
        items: items as PaginateResult<T, O>,
        total,
        page,
        per_page: limit,
        total_pages: Math.ceil(total / limit),
    })
}