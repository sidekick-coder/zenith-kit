export default class CookieService {
    public cookies: Map<string, string>
    public prefix: string

    constructor(data: Partial<CookieService> = {}) {
        this.cookies = data.cookies || new Map<string, string>()
        this.prefix = data.prefix || ''
    }

    public load(cookies: Record<string, string> | Map<string, string>) {
        if (cookies instanceof Map) {
            for (const [key, value] of cookies.entries()) {
                this.set(key, value)
            }

            return
        }

        for (const key of Object.keys(cookies)) {
            this.set(key, cookies[key])
        }
    }

    public get(name: string, defaultValue: string | null = null): string | null {
        const fullName = this.prefix + name
        
        return this.cookies.get(fullName) || defaultValue
    }

    public set(name: string, value: string, options?: any) {
        const fullName = this.prefix + name

        this.cookies.set(fullName, value)
    }

    public toRecord(): Record<string, string> {
        const result: Record<string, string> = {}

        for (const [key, value] of this.cookies.entries()) {
            if (key.startsWith(this.prefix)) {
                const unprefixedKey = key.slice(this.prefix.length)

                result[unprefixedKey] = value
            }
        }

        return result
    }
}