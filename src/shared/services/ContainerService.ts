type Constructor<T = object> = new (...args: any[]) => T

type EntryKey = string | symbol | Constructor

export default class ContainerService {
    private entries = new Map<EntryKey, any>()

    public loadFromRecord(record: Record<string, any>): void {
        Object.entries(record).forEach(([key, value]) => {
            this.set(key, value)
        })
    }

    public toRecord(): Record<string, any> {
        const record: Record<string, any> = {}

        for (const [key, value] of this.entries.entries()) {
            record[String(key)] = value
        }

        return record
    }

    public set(payload: EntryKey, value: any): void {
        let key = payload

        if (typeof payload === 'function' || typeof payload === 'object') {
            key = payload.name
        }

        this.entries.set(key, value)
    }

    public has(payload: EntryKey): boolean {
        let key = payload

        if (typeof payload === 'function' || typeof payload === 'object') {
            key = payload.name
        }

        return this.entries.has(key)
    }

    public get<T>(payload: EntryKey): T {
        let key = payload

        if (typeof payload === 'function' || typeof payload === 'object') {
            key = payload.name
        }

        if (!this.has(key)) {
            throw new Error(`entry not found: ${String(key)}`)
        }

        const entry = this.entries.get(key)
        
        
        return entry
    }

    public singleton<T>(classConstructor: Constructor<T>): T {
        const key = classConstructor.name
        const existingInstance = this.entries.get(key)
        
        if (existingInstance) {
            return existingInstance
        }
        
        const newInstance = new classConstructor()
        this.entries.set(key, newInstance)
        return newInstance
    }

    public load(entries: Record<any, any>): void {
        Object.entries(entries).forEach(([key, value]) => {
            this.set(key, value)
        })
    }

    public proxy<T = unknown>(key: EntryKey): T {
        return new Proxy({}, {
            get: (_target, prop) => {
                const entry = this.get<T>(key) as any
                const value = entry[prop]

                if (typeof value === 'function') {
                    return value.bind(entry)
                }

                return entry[prop]
            },
            set: (_target, prop, value) => {
                const entry = this.get<T>(key) as any

                entry[prop] = value

                return true
            }
        }) as T
    }

    public keys(): EntryKey[] {
        return Array.from(this.entries.keys())
    }
}
