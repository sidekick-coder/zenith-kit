import { exists } from './exists.ts'
import { create } from './create.ts'
import { undeleted } from './softDelete.ts'
import BaseException from '#server/exceptions/base.ts'
import db from '#server/facades/db.facade.ts'
import hasher from '#server/facades/hasher.facade.ts'
import emmitter from '#server/facades/emmitter.facade.ts'
import User from '#server/entities/user.entity.ts'

export interface UserPayload {
    name: string
    email: string
    username: string
    password: string
    verified_at?: Date | string | null
}

function userExists(email: string, username: string) {
    return exists('users', {
        query: q => q.selectAll()
            .where(undeleted)
            .where(eb => eb.or([
                eb('email', '=', email),
                eb('username', '=', username)
            ]))
    })
}

export async function createUser(payload: UserPayload) {

    if (await userExists(payload.email, payload.username)) {
        throw new BaseException('User with given email or username already exists', 400)
    }

    const userData = {
        name: payload.name,
        email: payload.email,
        username: payload.username,
        password: await hasher.hash(payload.password),
        verified_at: payload.verified_at || null
    }

    await emmitter.emitAndWait('user:before-create', { user: userData })

    const data = await create('users', {
        values: userData,
    })

    if (!data) {
        throw new BaseException('Failed to create user', 500)
    }

    const user = User.from(data)

    await emmitter.emitAndWait('user:after-create', { 
        user
    })

    return user
}