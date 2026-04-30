import type { Kysely } from 'kysely'
import type { DatabaseContract } from './DatabaseContract';

export interface DatabaseKysely extends Kysely<DatabaseContract> {
}
