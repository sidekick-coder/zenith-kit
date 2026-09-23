import auth from '#client/facades/auth.ts'
import type { NavigationGuard } from 'vue-router'

export interface GuestGuardOptions {
    redirect?: string
}

export function createGuestGuard(options?: GuestGuardOptions): NavigationGuard {
    return (to) => {
        let redirect = to.query.redirect as string | undefined

        if (!redirect) {
            redirect = options?.redirect
        }

        if (!redirect) {
            redirect = '/'
        }

        if (auth.user) {
            return redirect
        }
    }
}

const guestGuard = createGuestGuard()

export default guestGuard
