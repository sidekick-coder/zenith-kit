import LoggerService from './LoggerService.ts'

export default class TranslatorService {
    public entries: Map<string, string>
    public locale: string
    public localeLoaders: Map<string, () => Promise<Record<string, string>>>
    public debug: boolean = false
    public logger: LoggerService
    public cache: Map<string, Record<string, string>>

    constructor(data: Partial<TranslatorService> = {}) {
        this.entries = data.entries || new Map<string, string>()
        this.locale = data.locale || 'en'
        this.debug = data.debug || false
        this.cache = data.cache || new Map<string, Record<string, string>>()
        this.logger = data.logger || new LoggerService()
        this.localeLoaders = new Map<string, () => Promise<Record<string, string>>>()

        if (this.debug) {
            this.logger.debug('initialized in debug mode', { locale: this.locale })
        }
    }

    public get locales(): string[] {
        return Array.from(this.localeLoaders.keys())
    }

    public list(): { key: string; value: string }[] {
        const items: { key: string; value: string }[] = []

        this.entries.forEach((value, key) => {
            items.push({ 
                key,
                value 
            })
        })

        return items
    }


    public async getEntries(locale: string): Promise<Record<string, string>> {
        const cache = this.cache.get(locale)!
        
        if (cache && this.debug) {
            this.logger.debug(`load locale "${locale}" from cache`, {
                locale,
                length: Object.keys(cache).length
            })
        }
        
        if (cache) {
            return cache
        }

        const loader = this.localeLoaders.get(locale)

        if (!loader) {
            this.logger.warn(`no loader found for locale "${locale}"`)
            return {}
        }
        
        const entries = await loader()

        this.cache.set(locale, entries)

        if (this.debug) {
            this.logger.debug(`load locale ${locale}`, {
                locale,
                keys: Object.keys(entries).length
            })
        }

        return entries
    }
    
    public async load(locale: string){
        const entries = await this.getEntries(locale)
        
        this.entries = new Map<string, string>(Object.entries(entries))
        
        this.locale = locale
    }

    public t(key: string, args: any = {}): string {
        if (!this.entries.has(key) && this.debug) {
            this.logger.debug(`missing translation for key "${key}"`, {
                key,
                locale: this.locale
            })
        }

        const entry = this.entries.get(key) || key

        let translation = entry

        if (!Object.keys(args).length) {
            return translation
        }

        Object.entries(args).forEach(([aKey, aValue]) => {
            translation = translation.replace(`:${aKey}`, aValue)
        })

        return translation
    }

    public date(data: string | number | Date){
        const date = new Date(data)

        return date.toLocaleDateString(this.locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
    }

    public datetime(data: string | number | Date){
        const date = new Date(data)

        return date.toLocaleString(this.locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })
    }
}
