import type AuthService from '#client/services/auth.service.ts'
import container from './container'

const auth = container.proxy<AuthService>('auth')

if (import.meta.env.DEV && !import.meta.env.SSR) {
    (window as any).auth = auth
}

export default auth
