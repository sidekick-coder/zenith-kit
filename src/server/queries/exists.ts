import { list  } from './list.ts'
import type { ListOptions } from './list.ts'
import type { DatabaseContract as Database } from '#server/contracts/DatabaseContract.ts'

export async function exists<T extends keyof Database, O extends ListOptions<T>>(table: T, options?: O) {
    const rows = await list(table, options)

    const found = rows[0]

    return !!found
}