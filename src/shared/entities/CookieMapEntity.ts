export interface CookieMapEntityOptions {
    cookies?: Map<string, string>
    prefix?: string
}

export default class CookieMapEntity {
    public static __container_entry_key = 'CookieMapEntity'

    public cookies: Map<string, string>
    public prefix: string

    constructor(data?: CookieMapEntityOptions) {
        this.cookies = data?.cookies || new Map<string, string>()
        this.prefix = data?.prefix || ''
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

    // @ts-expect-error - We want to allow any options to be passed here, as they may be used by the underlying cookie
    //  eslint-disable-next-line @typescript-eslint/no-unused-vars
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
