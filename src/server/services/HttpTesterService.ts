import tokenRepository from "#server/facades/tokenRepository.ts"
import userRepository from "#server/facades/userRepository.ts"
import { BaseException, UserEntity } from "#shared/index.ts"
import type HttpService from "./HttpService"
import supertest, { type Test } from 'supertest'

export interface HttpTesterServiceOptions {
    http: HttpService
}

export default class HttpTesterService {
    public static __container_entry_key = 'HttpTesterService'
    public http: HttpService
    public request: supertest.SuperTest<supertest.Test>
    public headers: Record<string, string> = {}
    public cookies: Record<string, string> = {}

    constructor(options: HttpTesterServiceOptions) {
        this.http = options.http
        this.request = supertest(this.http.getExpressApp())
    }


    public create(request: Test) {
        for (const [key, value] of Object.entries(this.headers)) {
            request.set(key, value)
        }

        for (const [key, value] of Object.entries(this.cookies)) {
            request.set('Cookie', `${key}=${value}`)
        }

        return request

    }

    public get(url: string): Test {
        return this.create(this.request.get(url))
    }

    public post(url: string, body?: any): Test {
        return this.create(this.request.post(url).send(body))
    }

    public async loginByUser(user: UserEntity) {
        const token = await tokenRepository.generate({
            user_id: user.id,
        })

        this.cookies['Authorization'] = token.token
    }

    public async loginByUsername(username: string) {
        const user = await userRepository.findOne({ username })

        if (!user) {
            throw new BaseException('User not found')
        }

        return this.loginByUser(user)
    }
}
