import route from '#client/facades/route.ts'
import router from '#client/facades/router.ts'

import { useRouteQuery as vueUserRouteQuery } from '@vueuse/router'

export const useRouteQuery: typeof useRouteQuery = (key, defaultValue, options) => {
    return vueUserRouteQuery(key, defaultValue, {
        route,
        router,
        ...options
    })
}

