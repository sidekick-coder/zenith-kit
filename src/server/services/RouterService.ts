import { join } from 'lodash-es'
import Route from '#server/entities/RouteEntity.ts'
import type { Handler, Middleware, MiddlewareHandleResult } from '#server/contracts/RouterContract.ts'
import { compose } from '#shared/utils/compose.ts'
import Hooks from '#shared/mixins/HooksMixin.ts'
import { LoggerService } from '#shared/index.ts'
import { matchPath } from '#shared/utils/matchPaths.ts'

type RouteContext = 'global' | 'group' | 'route'

interface MiddlewareRegister {
    middleware: Middleware
    context: RouteContext
}

interface LoadOptions {
    debug?: boolean;
}

export interface RouterEvents {
    'router:registered': {
        router: RouterService
    }
    'router:loaded': {
        router: RouterService
    }
}


export default class RouterService<C = {}> extends compose(Hooks) {
    public static __container_entry_key = 'RouterService'

    public routes: Route[] = []

    public middlewares: MiddlewareRegister[] = []
    public prefixes: string[] = []

    public groups: RouterService<any>[] = []
    public groupPrefixes: string[] = []

    public debug = false
    public logger = new LoggerService()
    public metadata: Record<string, any> = {}

    constructor(data: Partial<RouterService<C>> = {}) {
        super()
        this.routes = data.routes || []
        this.middlewares = data.middlewares || []
        this.prefixes = data.prefixes || []
        this.groups = data.groups || []
        this.groupPrefixes = data.groupPrefixes || []
        this.debug = data.debug || false
        this.metadata = data.metadata || {}
        this.listeners = data.listeners || []
        this.logger = data.logger || new LoggerService()
    }

    public use<T extends Middleware>(middleware: T, context: RouteContext = 'route') {
        this.middlewares.push({
            middleware,
            context,
        })

        return this as RouterService<C & MiddlewareHandleResult<[typeof middleware]>>
    }

    public prefix(prefix: string) {
        this.prefixes.push(prefix)

        return this
    }

    public makePath(args: string): string {
        let result = join([...this.groupPrefixes, ...this.prefixes, args], '/')

        // remove duplicate slashes
        result = result.replace(/\/+/g, '/')

        return result
    }

    public add(payload: Pick<Route, 'path' | 'method' | 'handler'>) {
        const route = new Route({
            method: payload.method,
            path: this.makePath(payload.path),
            handler: payload.handler,
            middlewares: this.middlewares.map(m => m.middleware),
        })

        this.middlewares = this.middlewares.filter(m => m.context !== 'route')

        this.prefixes = [] // Reset prefixes after use

        this.routes.push(route)

        if (this.debug) {
            this.logger.debug('added route', route)
        }

        this.emit('added', route)
    }

    public get(path: string, handler: Handler<C>) {
        this.add({
            path,
            method: 'GET',
            handler,
        })
    }

    public post(path: string, handler: Handler<C>) {
        this.add({
            path,
            method: 'POST',
            handler,
        })
    }

    public put(path: string, handler: Handler<C>) {
        this.add({
            path,
            method: 'PUT',
            handler,
        })
    }

    public patch(path: string, handler: Handler<C>) {
        this.add({
            path,
            method: 'PATCH',
            handler,
        })
    }

    public many(methods: Route['method'][], path: string, handler: Handler<C>) {
        methods.forEach(method => {
            this.add({
                path,
                method,
                handler,
            })
        })
    }

    public delete(path: string, handler: Handler<C>) {
        this.add({
            path,
            method: 'DELETE',
            handler,
        })
    }


    public group() {
        const group = new RouterService<C>({
            listeners: this.listeners, // Inherit listeners from parent
            debug: this.debug,
        })

        group.groupPrefixes = this.prefixes // Inherit prefixes from parent
        group.middlewares = this.middlewares.map(r => ({
            middleware: r.middleware,
            context: 'group'
        }))

        this.groups.push(group)

        this.middlewares = this.middlewares.filter(m => m.context !== 'route')
        this.prefixes = [] // Reset prefixes after use

        return group
    }

    public resolve(method: string, path: string) {
        const route = this.list()
            .find(r => {
                if (r.method.toUpperCase() !== method.toUpperCase()) {
                    return false
                }

                return matchPath(r.path, path)
            })

        if (!route) {
            return null
        }

        return route
    }

    public async execute(route: Route, initialCtx: any) {
        if (!route.handler) {
            throw new Error(`Route handler not found for ${route.method} ${route.path}`)
        }

        const ctx = { ...initialCtx }

        for await (const middleware of route.middlewares) {
            const result = await middleware.handle(ctx)

            if (result && 'redirect' in result) {
                return result
            }

            Object.assign(ctx, result)
        }

        return route.handler(ctx)
    }

    public clear() {
        if (this.debug) {
            this.logger.debug('clear', { count: this.routes.length })
        }

        this.routes = []
        this.groups = []
    }

    public list() {
        return this.routes.concat(...this.groups.map(g => g.routes))
    }

    public async load(options: LoadOptions = {}) {
        this.debug = options.debug ?? this.debug

        if (this.debug) {
            this.logger.debug('service loaded in debug mode')
        }
    }

    public loadSync(options: LoadOptions = {}) {
        this.debug = options.debug ?? this.debug

        if (this.debug) {
            this.logger.debug('service loaded in debug mode')
        }
    }
}
