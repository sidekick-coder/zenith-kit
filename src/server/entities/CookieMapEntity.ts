import type {
    Request, 
    Response,
    CookieOptions
} from 'express'
import Base from '#shared/entities/CookieMapEntity.ts'
import config from '#server/facades/config.ts'

export default class CookieMapEntity extends Base {
    public request: Request
    public response: Response

    constructor(request: Request, response: Response) {
        super({
            cookies: new Map<string, string>(Object.entries(request.cookies)),
            prefix: config.get('cookie.prefix', '')
        })

        this.request = request
        this.response = response
    }

    public set(name: string, value: string, options?: CookieOptions) {
        const prefix = this.prefix

        const fullName = prefix + name

        const opts: CookieOptions = {
            httpOnly: true,
            ...options
        }

        this.response.cookie(fullName, value, opts)
        
        super.set(fullName, value, options)
    }
}
