import { PluginIpcClient } from './PluginIpcClient.ts'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RouteDefinition {
    method: HttpMethod
    path: string
}

export interface RouteRequest {
    requestId: string
    method: HttpMethod
    path: string
    body?: any
    headers?: Record<string, string>
    query?: Record<string, string>
    params?: Record<string, string>
}

export interface RouteResponsePayload {
    requestId: string
    status: number
    body?: any
    headers?: Record<string, string>
}

export interface RouteReply {
    status(code: number): RouteReply
    send(body?: any): void
}

export type RouteHandler = (req: RouteRequest, reply: RouteReply) => void | Promise<void>

interface RouteEntry extends RouteDefinition {
    handler: RouteHandler
    pattern: RegExp
    paramNames: string[]
}

function buildPattern(path: string): { pattern: RegExp; paramNames: string[] } {
    const paramNames: string[] = []

    const regexStr = path
        .replace(/:[a-zA-Z_][a-zA-Z0-9_]*/g, (match) => {
            paramNames.push(match.slice(1))
            return '([^/]+)'
        })
        .replace(/\//g, '\\/')

    return { pattern: new RegExp(`^${regexStr}$`), paramNames }
}

export class PluginRouter {
    private routes: RouteEntry[] = []

    constructor(private readonly client: PluginIpcClient) {
        this.client.on<RouteRequest>('router:request', (req) => this.dispatch(req))
    }

    private async dispatch(req: RouteRequest): Promise<void> {
        for (const route of this.routes) {
            if (route.method !== req.method) continue

            const match = route.pattern.exec(req.path)
            if (!match) continue

            const params: Record<string, string> = {}
            route.paramNames.forEach((name, i) => {
                params[name] = match[i + 1]
            })

            let statusCode = 200
            const headers: Record<string, string> = {}

            const reply: RouteReply = {
                status(code) {
                    statusCode = code
                    return this
                },
                send: (body?: any) => {
                    const response: RouteResponsePayload = {
                        requestId: req.requestId,
                        status: statusCode,
                        body,
                        headers,
                    }
                    this.client.emit('router:response', response)
                },
            }

            await route.handler({ ...req, params }, reply)
            return
        }

        this.client.emit('router:response', {
            requestId: req.requestId,
            status: 404,
            body: { message: 'Not Found' },
        } satisfies RouteResponsePayload)
    }

    private register(method: HttpMethod, path: string, handler: RouteHandler): void {
        const { pattern, paramNames } = buildPattern(path)

        this.routes.push({ method, path, handler, pattern, paramNames })
        this.client.emit('router:register', { method, path } satisfies RouteDefinition)
    }

    public get(path: string, handler: RouteHandler): void {
        this.register('GET', path, handler)
    }

    public post(path: string, handler: RouteHandler): void {
        this.register('POST', path, handler)
    }

    public put(path: string, handler: RouteHandler): void {
        this.register('PUT', path, handler)
    }

    public patch(path: string, handler: RouteHandler): void {
        this.register('PATCH', path, handler)
    }

    public delete(path: string, handler: RouteHandler): void {
        this.register('DELETE', path, handler)
    }
}
