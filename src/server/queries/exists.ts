import { list  } from './list.ts'
import type { ListOptions } from './list.ts'
import type { Database } from '#server/contracts/database.contract.ts'

export async function exists<T extends keyof Database, O extends ListOptions<T>>(table: T, options?: O) {
    const rows = await list(table, options)

    const found = rows[0]

    return !!found
}