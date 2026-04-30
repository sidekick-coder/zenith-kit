import { number, array } from './urlValidator.ts'
import * as v from 'valibot'

export interface PaginationParams {
    maxLimit?: number
    orderFields?: string[]
}


export const base = (options: PaginationParams = {}) => v.object({
    page: v.optional(number(), 1),
    limit: v.optional(number(), options.maxLimit || 100),
    orderBy: v.optional(options.orderFields ? array(v.picklist(options.orderFields)) : array(v.string()), []),
    orderDirection: v.optional(array(v.union([v.literal('asc'), v.literal('desc')])), []),
})
