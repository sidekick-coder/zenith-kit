import type { Kysely } from 'kysely'
import container from './container'
import type { DatabaseContract } from '#server/contracts/DatabaseContract.ts'

export const key = 'database'

const database = container.proxy<Kysely<DatabaseContract>>(key)

export default database

