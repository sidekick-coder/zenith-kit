import userRepository from "#server/facades/userRepository.ts";
import type { UserEntity } from "#shared/index.ts";
import { faker } from '@faker-js/faker'

export async function createUser(payload: Partial<UserEntity> = {}): Promise<UserEntity> {
    return await userRepository.create({
        name: faker.person.fullName(),
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        ...payload
    })
}

