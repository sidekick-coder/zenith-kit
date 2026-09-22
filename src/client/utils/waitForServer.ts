import { getThemeColors } from "#client/components.ts"

export interface WaitForServerOptions {
    redirectTo?: string
    delay?: number
}

export function waitForServer(options: WaitForServerOptions = {}) {
    const url = new URL('/api/reloader', window.location.origin)
    const colors = getThemeColors()

    url.searchParams.append('redirect_to', options.redirectTo || window.location.href)
    url.searchParams.append('delay', options.delay?.toString() || '3000')

    for (const [key, value] of Object.entries(colors)) {
        url.searchParams.append(`colors[${key}]`, value)
    }

    window.location.href = url.toString()
}
