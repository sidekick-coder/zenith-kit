import AuthService from '#client/services/AuthService.ts'
import container from './container'

const auth = container.proxy<AuthService>(AuthService)

if (import.meta.env.DEV && !import.meta.env.SSR) {
    (window as any).auth = auth
}

export default auth
