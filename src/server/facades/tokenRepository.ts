import TokenRepository from "#server/repositories/TokenRepository.ts";
import database from "#server/facades/database.ts";

const tokenRepository = new TokenRepository()

tokenRepository
    .setDatabase(database)
    .setTable('tokens')
    .setPrimaryKey('id')

export default tokenRepository
