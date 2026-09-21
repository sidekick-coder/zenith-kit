import container from '#client/facades/container'
import { computed, ref } from 'vue'

export interface CookieOptions {
    /** Convenient option for setting the expiry time relative to the current time in **milliseconds**. */
    maxAge?: number | undefined;
    /** Indicates if the cookie should be signed. */
    signed?: boolean | undefined;
    /** Expiry date of the cookie in GMT. If not specified (undefined), creates a session cookie. */
    expires?: Date | undefined;
    /** Flags the cookie to be accessible only by the web server. */
    httpOnly?: boolean | undefined;
    /** Path for the cookie. Defaults to “/”. */
    path?: string | undefined;
    /** Domain name for the cookie. Defaults to the domain name of the app. */
    domain?: string | undefined;
    /** Marks the cookie to be used with HTTPS only. */
    secure?: boolean | undefined;
    /**
     * Value of the “SameSite” Set-Cookie attribute.
     * @link https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site-00#section-4.1.1.
     */
    sameSite?: boolean | 'lax' | 'strict' | 'none' | undefined;
    /**
     * Value of the “Priority” Set-Cookie attribute.
     * @link https://datatracker.ietf.org/doc/html/draft-west-cookie-priority-00#section-4.3
     */
    priority?: 'low' | 'medium' | 'high';
    /** Marks the cookie to use partioned storage. */
    partitioned?: boolean | undefined;
}

export interface UseCookieOptionsWithTransform extends CookieOptions {
    parse?: (value: any) => any
    serialize?: (value: any) => string
    default?: () => any
}


function useCookieClient(name: string, options?: CookieOptions) {
    const cookie = ref<string | null>(null)

    const docCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))

    if (docCookie) {
        cookie.value = docCookie.split('=')[1]
    }

    return computed({
        get: () => {
            return cookie.value
        },
        set: (value) => {
            cookie.value = value

            const payload = [
                `${name}=${value}`,
                `path=${options?.path || '/'}`,
            ]

            if (options?.maxAge) {
                payload.push(`max-age=${options.maxAge}`)
            }

            if (options?.expires) {
                payload.push(`expires=${options.expires.toUTCString()}`)
            }

            if (options?.httpOnly) {
                payload.push('HttpOnly')
            }

            if (options?.secure) {
                payload.push('Secure')
            }

            if (options?.sameSite) {
                payload.push(`SameSite=${options.sameSite}`)
            }

            if (options?.domain) {
                payload.push(`Domain=${options.domain}`)
            }

            if (options?.priority) {
                payload.push(`Priority=${options.priority}`)
            }

            if (options?.partitioned) {
                payload.push('Partitioned')
            }


            document.cookie = payload.join('; ')
        }
    })
}

function useCookieServer(name: string, _options?: CookieOptions) {
    const cookies = container.get('cookies') as Record<string, string>

    const cookie = cookies[name] || null

    return computed({
        get() {
            return cookie
        },
        set() {
            throw new Error('Cannot set cookie on server side')
        }
    })

}

export function useCookie<T = string>(name: string, options?: UseCookieOptionsWithTransform) {
    const isClient = 'window' in globalThis && 'document' in globalThis

    const cookie = isClient ? useCookieClient(name, options) : useCookieServer(name, options)

    return computed<T>({
        get: () => {
            const value = cookie.value

            if (value === null || value === undefined) {
                return options?.default ? options.default() : null as unknown as T
            }

            return options?.parse ? options.parse(value) : value as unknown as T
        },
        set: (newValue) => {
            cookie.value = options?.serialize ? options.serialize(newValue) : newValue as unknown as string
        }
    })
}


export function getCookie(name: string) {
    const isClient = 'window' in globalThis && 'document' in globalThis

    if (isClient) {
        const docCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(name + '='))

        if (docCookie) {
            return docCookie.split('=')[1]
        }

        return null
    }

    const cookies = container.get('cookies') as Record<string, string>

    return cookies[name] || null

}
