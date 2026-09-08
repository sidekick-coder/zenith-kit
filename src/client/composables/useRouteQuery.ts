// import route from '#client/facades/route.ts'
// import router from '#client/facades/router.ts'

import { useRouteQuery as vueUserRouteQuery } from '@vueuse/router'
import { useRoute, useRouter } from 'vue-router'

const zenithUseRouteQuery= (key: any, defaultValue: any, options: any) => {
    return vueUserRouteQuery(key, defaultValue, {
        route: useRoute(),
        router: useRouter(),
        ...options
    })
}

export const useRouteQuery = zenithUseRouteQuery as typeof vueUserRouteQuery

