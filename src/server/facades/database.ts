import container from './container'
import type { DatabaseContract } from '#server/contracts/DatabaseContract.ts'
import DatabaseGateway from '#server/gateways/DatabaseGateway.ts'

const database = container.proxy<DatabaseGateway<DatabaseContract>>(DatabaseGateway)

export default database

