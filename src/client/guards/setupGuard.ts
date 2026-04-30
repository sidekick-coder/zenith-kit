import type { NavigationGuard } from 'vue-router'
import config from '#client/facades/config.ts'

const setupGuard: NavigationGuard = (to) => {
    const setup = config.get<any>('setup')
    
    const completed = !setup?.need_database && !setup?.need_users
    
    if (completed && to.path.startsWith('/setup')) {
        return '/'
    }
    
    if (completed) {
        return true
    }
    
    if (!to.path.startsWith('/setup')) {
        return '/setup'
    }
    
    if (to.path === '/setup') {
        return true
    }    

    if (setup?.need_database) {
        return to.path !== '/setup/database' ? '/setup/database' : true
    }

    if (setup?.need_users) {
        return to.path !== '/setup/user' ? '/setup/user' : true
    }

    return true
}

export default setupGuard
