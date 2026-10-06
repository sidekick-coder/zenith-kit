import $fetch from '#client/facades/fetcher.ts'
import User from '#shared/entities/UserEntity.ts'

interface LogoutOptions {
    redirect?: string
}

export interface AuthServiceOptions {
    user?: User | null
    disabled?: boolean
}

export default class AuthService {
    public static __container_entry_key = 'AuthService'
    public user: User | null
    public disabled: boolean = false

    constructor(data: Partial<AuthService> = {}) {
        this.user = data.user || null
        this.disabled = data.disabled || false
    }

    public async logout(options?: LogoutOptions): Promise<void> {
        const [error] = await $fetch.try('/auth/logout', { method: 'POST' })

        if (error) {
            return
        }

        window.location.href = options?.redirect || '/'
    }
}
