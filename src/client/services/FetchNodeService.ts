import type { FetchOptions } from './FetchService.ts'
import FetchService from './FetchService.ts'
// import type RouterService from '#server/services/RouterService.ts'
import CookieService from '#shared/services/CookieService.ts'
import config from '#client/facades/config.ts'
import container from '#client/facades/container.ts'
import { parseUrlParams, parseUrlQuery } from '#shared/utils/parseRouteUrl.ts'

export default class FetchNodeService extends FetchService {
    public async fetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
        const isInternal = !url.startsWith('http://') && !url.startsWith('https://')

        if (!isInternal) {
            return this.fetchExternal<T>(url, options)
        }

        return this.fetchInternal<T>(url, options)
    }

    protected async fetchExternal<T>(url: string, options: FetchOptions = {}): Promise<T> {
        const fullUrl = this.buildUrl(url, options.query)
        const fetchOptions = this.buildRequestInit(options)

        const response = await fetch(fullUrl, fetchOptions)

        if (!response.ok) {
            await this.handleError(response)
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return this.parseResponse<T>(response)
    }

    protected async fetchInternal<T>(url: string, options: FetchOptions = {}): Promise<T> {
        const router =  container.get<any>('RouterService')
        const method = options.method || 'GET'
        const route = router.resolve(method, url)
        const cookie = new CookieService({
            prefix: config.get('cookie.prefix', '')
        })
        
        if (container.has('cookies')) {
            cookie.load(container.get<Record<string, string>>('cookies'))
        }

        if (!route || !route.handler) {
            throw new Error(`Route not found for ${method} ${url}`)
        }

        const result = await router.execute(route, {
            url: url,
            params: parseUrlParams(route.path, url),
            query: options.query || parseUrlQuery(url),
            body: options.data || options.body,
            method: method.toLowerCase(),
            cookie: cookie
        })

        return result as Promise<T>
    }
}
