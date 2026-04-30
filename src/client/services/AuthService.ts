import $fetch from '#client/facades/fetch.ts'
import User from '#shared/entities/UserEntity.ts'

interface LogoutOptions {
    redirect?: string
}

export default class AuthService {
    public user: User | null

    constructor(data: Partial<AuthService> = {}) {
        this.user = data.user || null
    }

    public async logout(options?: LogoutOptions): Promise<void> {
        const [error] = await $fetch.try('/auth/logout', { method: 'POST' })

        if (error) {
            return
        }

        window.location.href = options?.redirect || '/'
    }
}
