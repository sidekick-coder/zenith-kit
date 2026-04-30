import type { NavigationGuard } from 'vue-router'
import auth from '#client/facades/auth.ts'

export interface AuthGuardOptions {
    redirect: string
    exclude?: string[]
}

export function createAuthGuard(options: AuthGuardOptions): NavigationGuard {
    const exclude = options.exclude || ['/auth/login', '/auth/register']
    
    return (to) => {
        if (!auth.user && !exclude.includes(to.path)) {
            return options.redirect
        }
    }
}

const authGuard = createAuthGuard({ 
    redirect: '/auth/login',
})

export default authGuard
