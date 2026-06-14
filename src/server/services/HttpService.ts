import type { Server } from 'http'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import Router from './RouterService.ts'
import ExceptionService from './ExceptionService.ts'
import Route from '#server/entities/RouteEntity.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import { EmmitterService, LoggerService } from '#shared/index.ts'
import type { HttpContext } from '#server/contracts/HttpContextContract.ts'
import CookieMapEntity from '#server/entities/CookieMapEntity.ts'
import EnvService from './EnvService.ts'

export interface HttpServiceOptions {
    debug?: boolean;
    router?: Router;
    logger?: LoggerService;
    exception?: ExceptionService;
    emmitter?: EmmitterService;
    env?: EnvService;
    origins?: string[];
}

export default class HttpService {
    public static __container_entry_key = 'HttpService'

    public app: express.Application
    public server: Server | null = null
    public router: Router
    public exception: ExceptionService
    public logger: LoggerService
    public emmitter: EmmitterService
    public env: EnvService
    public debug = false
    public onUnhandlerRouted: ((req: express.Request, res: express.Response) => void) | null = null

    constructor(options: HttpServiceOptions) {
        this.debug = options.debug || false
        this.logger = options.logger || new LoggerService()
        this.router = options.router || new Router()
        this.emmitter = options.emmitter || new EmmitterService()
        this.env = options.env || new EnvService()
        this.exception = options.exception || new ExceptionService({ logger: this.logger, env: this.env })

        this.app = express()
        this.app.use(cookieParser())
        this.app.use(this.parser)
    }

    public getExpressApp(): express.Application {
        return this.app
    }

    public cors(options: cors.CorsOptions) {
        this.app.use(cors(options))
    }

    public use: express.Application['use'] = (...args: any[]) => {
        this.app.use(...args)

        return this.app
    }

    public routes() {
        this.app.use('*all', (req, res) => {
            const url = new URL(req.originalUrl, `http://${req.headers.host}`)
            const method = req.method.toLowerCase()

            const route = this.router.resolve(method, url.pathname)

            if (this.router.debug) {
                this.router.logger.debug(`${method.toUpperCase()} ${url.pathname}`)
            }

            if (route) {

                return this.execute(url, req, res, route)
            }

            if (url.pathname.startsWith('/api/')) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: `No API route found for ${method.toUpperCase()} ${url}`,
                })
            }

            if (this.onUnhandlerRouted) {
                return this.onUnhandlerRouted(req, res)
            }
        })
    }

    public parser(req: express.Request, res: express.Response, next: express.NextFunction) {
        const contentType = req.headers['content-type'] || ''

        if (contentType.startsWith('multipart/form-data')) {
            // Skip JSON and URL-encoded parsers for multipart requests
            return next()
        }

        // For other content types, parse JSON and URL-encoded body
        express.json()(req, res, (err) => {
            if (err) return next(err)

            express.urlencoded({ extended: true })(req, res, next)
        })
    }

    public async execute(url: URL, request: express.Request, response: express.Response, route: Route) {
        const ctx: Omit<HttpContext, 'acl'> = {
            response,
            request,

            url: url.pathname,
            method: request.method.toLowerCase(),
            params: Route.params(route.path, url.pathname),
            query: Route.query(url.href),
            body: request.body || {},

            cookie: new CookieMapEntity(request, response)
        }

        const [error, result] = await tryCatch(() => this.router.execute(route, ctx))

        if (error) {
            this.exception.handle(error, response)
            return
        }

        if (response.headersSent) {
            return // if headers are already sent, do not modify the response
        }

        if (result && result.redirect) {
            response.redirect(result.redirect)
            return
        }

        // headers not set 
        response.status(200)

        if (typeof result === 'object' || Array.isArray(result)) {
            response.setHeader('Content-Type', 'application/json')
        }

        response.send(result)
    }

    public start() {
        const port = this.env.get('ZENITH_PORT')
        const host = this.env.get('ZENITH_HOST')

        const url = `http://${host}:${port}`

        this.server = this.app.listen(port, host, () => {
            this.logger.info('server started', {
                url,
                env: this.env.get('NODE_ENV'),
            })

            this.emmitter.emit('http:started')
        })
    }

    public stop() {
        return new Promise<void>((resolve) => {
            if (!this.server) {
                this.logger.warn('server is not running')
                return resolve()
            }

            this.server.on('close', () => {
                resolve()

                this.logger.info('server stopped', {
                    pid: process.pid,
                    env: this.env.get('NODE_ENV'),
                })
            })

            this.server.close()

        })
    }
}

