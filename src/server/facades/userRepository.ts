import db from '#server/facades/database.ts'
import UserRepository from '#server/repositories/UserRepository.ts'

const userRepository = new UserRepository(db as any)

export default userRepository

