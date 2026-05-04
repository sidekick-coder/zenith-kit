import BaseException from "#shared/exceptions/BaseException.ts"

export interface CookieMapEntityOptions {
    headers?: Record<string, string>
    setHeader?: (name: string, value: string) => void
}

export default class HeaderMapEntity {
    public static __container_entry_key = 'HeaderMapEntity'
    public entries: Map<string, string>
    public setHeader?: (name: string, value: string) => void

    constructor(data?: CookieMapEntityOptions) {
        this.entries = new Map<string, string>()
        this.setHeader = data?.setHeader

        if (data?.headers) {
            this.loadFromRecord(data.headers)
        }
    }

    public loadFromRecord(cookies: Record<string, string>) {
        for (const key of Object.keys(cookies)) {
            this.set(key, cookies[key])
        }
    }

    public get(name: string, defaultValue: string | null = null): string | null {
        return this.entries.get(name) || defaultValue
    }

    public set(name: string, value: string) {
        if (!this.setHeader) {
            throw new BaseException('setHeader function is not defined')
        }

        this.entries.set(name, value)
    }

    public toRecord(): Record<string, string> {
        const result: Record<string, string> = {}

        const entries = Array.from(this.entries.entries())

        for (const [key, value] of entries) {
            result[key] = value
        }

        return result
    }
}
