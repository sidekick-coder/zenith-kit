import qs from 'qs'
import type { Handler,  Middleware } from '#server/contracts/RouterContract.ts'

type RouteMethod = 'get' 
    | 'GET' 
    | 'post' 
    | 'POST' 
    | 'put' 
    | 'PUT' 
    | 'patch' 
    | 'PATCH' 
    | 'delete' 
    | 'DELETE'

export default class Route {
    public path: string = ''
    public method: RouteMethod = 'get'
    public handler: Handler<any> | null = null
    public middlewares: Middleware[] = []
    public metadata: Record<string, any> | null = {}

    constructor(data: Partial<Route> = {}) {
        this.path = data.path || ''
        this.method = data.method || 'get'
        this.handler = data.handler || null
        this.middlewares = data.middlewares || []
        this.metadata = data.metadata || {}
    }

    public static params(routePath: string, requestPath: string): Record<string, string> {
        const params: Record<string, string> = {}

        const routeSegments = routePath.split('/').filter(Boolean)
        const requestSegments = requestPath.split('/').filter(Boolean)

        for (let i = 0; i < routeSegments.length; i++) {
            const routeSegment = routeSegments[i]
            const requestSegment = requestSegments[i]

            if (routeSegment.startsWith(':')) {
                const paramName = routeSegment.slice(1) // Remove the ':' prefix
                params[paramName] = requestSegment
            }
            
            if (routeSegment === '*') {
                // Capture all remaining segments as a single path
                const remainingSegments = requestSegments.slice(i)
                params['*'] = remainingSegments.join('/')
                break
            }
        }

        return params
    }

    public static query(requestPath: string): Record<string, string> {
        const query: Record<string, string> = {}
        const queryString = requestPath.split('?')[1]

        if (!queryString) {
            return query
        }

        return qs.parse(queryString)
    }

    public toJSON() {
        return {
            path: this.path,
            method: this.method,
            middlewares: this.middlewares.map(mw => mw.constructor.name),
            metadata: this.metadata
        }
    }
}
