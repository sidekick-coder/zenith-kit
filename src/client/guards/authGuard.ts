import type { NavigationGuard, RouteLocationNormalized } from 'vue-router'
import auth from '#client/facades/auth.ts'

export interface AuthGuardOptions {
    redirect: string | ((to: RouteLocationNormalized) => string)
    exclude?: string[]
}

export function createAuthGuard(options: AuthGuardOptions): NavigationGuard {
    const exclude = options.exclude || ['/auth/login', '/auth/register']

    return (to) => {

        if (!auth.user && !exclude.includes(to.path)) {
            const redirectPath = typeof options.redirect === 'function' ? options.redirect(to) : options.redirect

            return redirectPath
        }
    }
}

const authGuard = createAuthGuard({
    redirect: to => '/auth/login?redirect=' + encodeURIComponent(to.fullPath),
})

export default authGuard
