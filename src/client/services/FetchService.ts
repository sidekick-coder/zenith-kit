import { toast } from 'vue-sonner'
import qs from 'qs'
import { tryCatch } from '#shared/utils/tryCatch.ts'

export interface FetchOptions extends RequestInit {
    query?: Record<string, any>
    data?: Record<string, any>
}

export default class FetchService {
    protected async handleError(response: Response) {    
        const contentType = response.headers.get('Content-Type') || ''

        if (!contentType.includes('application/json')) {
            toast.error($t('Internal Server Error'))
            return
        }

        if (response.headers.get('Content-Type')?.includes('json')) {
            const data = await response.json()
                .catch(() => ({ message: $t('Internal Server Error') }))

            if (data.message) {
                toast.error(data.message)
            }    
        }
    }

    protected buildUrl(url: string, query?: Record<string, any>): string {
        if (!query) {
            return url
        }

        const queryString = qs.stringify(query, { arrayFormat: 'brackets' })

        return url + '?' + queryString
    }

    protected buildRequestInit(options: FetchOptions): RequestInit {
        const fetchOptions: RequestInit = { ...options }

        if (options.data) {
            fetchOptions.body = JSON.stringify(options.data)
            fetchOptions.headers = {
                ...fetchOptions.headers,
                'Content-Type': 'application/json',
            }
        }

        return fetchOptions
    }

    protected async parseResponse<T>(response: Response): Promise<T> {
        if (response.headers.get('Content-Type')?.includes('json')) {
            return response.json() as Promise<T>
        }

        return response.text() as Promise<T>
    }

    public async fetch<T>(_url: string, _options: FetchOptions = {}): Promise<T> {
        throw new Error('Method not implemented')
    }

    public async try<T = any>(url: string, options: FetchOptions = {}) {
        return tryCatch(() => this.fetch<T>(url, options))
    }

    public async get<T = any>(url: string, options: FetchOptions = {}) {
        return this.fetch<T>(url, {
            ...options,
            method: 'GET',
        })
    }

    public async post<T = any>(url: string, options: FetchOptions = {}) {
        return this.fetch<T>(url, {
            ...options,
            method: 'POST',
        })
    }

    public async put<T = any>(url: string, options: FetchOptions = {}) {
        return this.fetch<T>(url, {
            ...options,
            method: 'PUT',
        })
    }

    public async delete<T = any>(url: string, options: FetchOptions = {}) {
        return this.fetch<T>(url, {
            ...options,
            method: 'DELETE',
        })
    }
}
