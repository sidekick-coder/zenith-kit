import {
    createRouter as createVueRouter,
    createMemoryHistory,
    createWebHistory
} from 'vue-router'
import type { NavigationGuard, Router } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { DefineComponent } from 'vue'
import setupGuard from '#client/guards/setupGuard.ts'
import set from 'lodash-es/set.js'

export interface RouterEvents {
    'router:registered': {
        router: RouterService
    }
    'router:loaded': {
        router: RouterService
    }
}

export interface RouterSource {
    files: Record<string, any>
    prefix?: string
    layout?: string
    guards?: NavigationGuard[] | ((record: RouteRecordRaw) => NavigationGuard[]);
    strip?: (string | RegExp)[];
    exclude?: (string | RegExp)[];
    refine?: (records: RouteRecordRaw[]) => RouteRecordRaw[];
}

interface RouterServiceOptions {
    ssr?: boolean
    debug?: boolean
}

export default class RouterService {
    public static __container_entry_key = 'RouterClientService'

    public vueRouter: Router

    constructor(options: RouterServiceOptions = {}) {
        const ssr = options.ssr ?? false

        const router = createVueRouter({
            history: ssr ? createMemoryHistory() : createWebHistory(),
            routes: [],
            scrollBehavior(_to, _from, savedPosition) {
                if (savedPosition) {
                    return savedPosition
                }

                return { top: 0 }
            },
        })

        router.beforeEach(setupGuard)

        this.vueRouter = router
    }

    public addSource(source: RouterSource) {
        const strip = source.strip || []
        const exclude = source.exclude || []
        const imports = source.files

        let routes: RouteRecordRaw[] = []

        const match = (filename: string, rule: string | RegExp) => {
            if (typeof rule === 'string') {
                return filename.includes(rule)
            }

            return rule.test(filename)
        }

        for (const [filename, component] of Object.entries(imports)) {
            if (exclude.some(rule => match(filename, rule))) {
                continue
            }

            let parts = filename
                .replace(/\.vue$/, '')
                .split('/')
                .filter(p => p && !p.startsWith('.'))
                .map(part => {
                    let p = part

                    if (p.startsWith('[') && p.endsWith(']')) {
                        p = ':' + p.slice(1, -1)
                    }

                    return p
                })


            // Strip specific segments
            if (source.strip?.length) {
                parts = parts.filter(p => !strip.some(rule => match(p, rule)))
            }

            let path = parts.join('/').replace(/index$/, '')

            if (source.prefix) {
                path = source.prefix + '/' + path
            }

            if (!path.startsWith('/')) {
                path = '/' + path
            }

            if (path.endsWith('/')) {
                path = path.slice(0, -1)
            }

            const record = {
                path: path,
                component: component as DefineComponent,
                beforeEnter: [] as NavigationGuard[],
            }

            if (source.guards && Array.isArray(source.guards)) {
                record.beforeEnter = source.guards
            }

            if (source.guards && typeof source.guards === 'function') {
                record.beforeEnter = source.guards(record)
            }

            if (source.layout) {
                set(record, 'meta.layout', source.layout)
            }

            routes.push(record)
        }

        if (source.refine) {
            routes = source.refine(routes)
        }

        routes.forEach(route => this.vueRouter.addRoute(route))
    }

    public push(path: string) {
        return this.vueRouter.push(path)
    }

    public isReady() {
        return this.vueRouter.isReady()
    }
}
