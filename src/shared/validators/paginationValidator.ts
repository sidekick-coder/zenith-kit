import { number, array } from './urlValidator.ts'
import * as v from 'valibot'

export interface PaginationParams {
    maxLimit?: number
    orderFields?: string[]
}


export const base = (options: PaginationParams = {}) => v.object({
    page: v.optional(number(), 1),
    limit: v.optional(number(), options.maxLimit || 100),
    orderBy: v.nullish(options.orderFields ? array(v.picklist(options.orderFields)) : array(v.string()), []),
    orderDirection: v.nullish(array(v.union([v.literal('asc'), v.literal('desc')])), []),
})

export function pagination(options: PaginationParams = {}) {
    return base(options)
}

pagination.base = base
