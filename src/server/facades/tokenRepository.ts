import db from '#server/facades/database.ts'
import TokenRepository from '#server/repositories/TokenRepository.ts'

const tokenRepository = new TokenRepository(db as any)

export default tokenRepository

