import { get, set, has, unset } from 'lodash-es'

interface Entry {
    key: string
    value: any 
    source: string
}

export default class ConfigService {
    public entries: Map<string, Entry>

    constructor() {
        this.entries = new Map()
    }

    public list(){
        return Array.from(this.entries.values())
    }

    public parseValue(value: any): any {
        if (typeof value === 'string' && value.endsWith(':boolean')) {
            return value.replace(':boolean', '').trim() === 'true'
        }

        return value
    }

    public loadFromRecord(record: Record<string, any>, source = 'unknow'): void {
        for (const [key, value] of Object.entries(record)) {
            this.entries.set(key, {
                key,
                value: this.parseValue(value),
                source
            })
        }
    }

    public loadFromEntries(entries: [string, any][], source = 'unknow'): void {
        for (const [key, value] of entries) {
            this.entries.set(key, {
                key,
                value: this.parseValue(value),
                source
            })
        }
    }

    public toRecord(): Record<string, any> {
        const record: Record<string, any> = {}

        for (const [key, entry] of this.entries.entries()) {
            record[key] = entry.value
        }

        return record
    }

    public has(key: string): boolean {
        const entry = this.entries.get(key)

        if (entry) {
            return true
        }

        if (!key.includes('.')) {
            return false
        }

        const primary = key.split('.')[0]
        const primaryEntry = this.entries.get(primary)

        if (!primaryEntry) {
            const entry = this.entries.get(key)
            
            return entry ? true : false
        }

        const value = primaryEntry.value

        if (typeof value !== 'object' || Array.isArray(value)) {
            return false
        }

        return has(value, key.substring(primary.length + 1))
    }

    public get<T = any | undefined>(key: string, defaultValue?: any): T {
        const entry = this.entries.get(key)

        if (entry) {
            return entry.value as T
        }

        if (!key.includes('.')) {
            return defaultValue
        }

        const primary = key.split('.')[0]
        const primaryEntry = this.entries.get(primary)

        if (!primaryEntry) {
            const entry = this.entries.get(key)
            
            return entry ? entry.value : defaultValue
        }

        const value = primaryEntry.value

        if (typeof value !== 'object' || Array.isArray(value)) {
            return defaultValue
        }

        const result = get(value, key.substring(primary.length + 1), defaultValue)

        return result
    }

    public getOne<T = any | undefined>(keys: string[], defaultValue?: any): T {
        for (const key of keys) {
            if (this.has(key)) {
                return this.get<T>(key)
            }
        }

        return defaultValue
    }

    public set(key: string, value: any, source = 'runtime'): void {
        if (!key.includes('.')) {
            this.entries.set(key, {
                key: key,
                source: source,
                value
            })
            return
        }

        const primary = key.split('.')[0]
        let primaryValue = this.get(primary, {})

        if (typeof primaryValue !== 'object' || Array.isArray(primaryValue)) {
            primaryValue = {}
        }

        set(primaryValue, key.substring(primary.length + 1), value)

        this.entries.set(primary, {
            key: primary,
            source: source,
            value: primaryValue
        })
    }

    public unset(key: string): void {
        if (!key.includes('.')) {
            this.entries.delete(key)
            return
        }

        const primary = key.split('.')[0]
        const primaryValue = this.get(primary, {})

        if (!primaryValue) return

        if (typeof primaryValue !== 'object' || Array.isArray(primaryValue)) {
            return
        }

        unset(primaryValue, key.substring(primary.length + 1))

        this.entries.set(primary, {
            key: primary,
            source: 'runtime',
            value: primaryValue
        })
    }

    public clear(): void {
        this.entries.clear()
    }
}
