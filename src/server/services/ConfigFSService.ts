import fs from 'fs'
import path from 'path'
import { set } from 'lodash-es'
import { basePath } from '#server/utils/basePath.ts'
import ConfigService from '#shared/services/ConfigService.ts'
import yaml from 'js-yaml'
import logger from '#server/facades/logger.ts'
import type LoggerService from '#shared/services/LoggerService.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

export interface ConfigFSServiceOptions {
    directory?: string
    format?: 'json' | 'yml'
    formatOptions?: Record<string, any>
    debug?: boolean
    logger?: LoggerService
}

export default class ConfigFSService extends ConfigService {
    public logger: LoggerService
    public debug = false
    public format: 'json' | 'yml' = 'json'
    public formatOptions: Record<string, any> = {}
    public directory: string


    constructor(options: ConfigFSServiceOptions = {}) {
        super()
        this.debug = options.debug ?? false
        this.directory = options.directory ?? basePath('config')
        this.logger = options.logger ?? logger.child({ label: 'config' })
        this.format = options.format ?? 'json'
        this.formatOptions = options.formatOptions ?? {}

        if (this.debug) {
            this.logger.debug('service initialized in debug mode')
        }
    }

    public async write(entry: string, data: any) {
        const ext = this.format === 'yml' ? 'yml' : 'json'
        const filename = path.join(this.directory, `${entry}.${ext}`)

        let content = JSON.stringify(data, null, this.formatOptions.indent || 4)

        if (this.format === 'yml') {
            content = yaml.dump(data, this.formatOptions)
        }

        await fs.promises.writeFile(filename, content, 'utf-8')
    }

    public writeSync(entry: string, data: any) {
        const ext = this.format === 'yml' ? 'yml' : 'json'
        const filename = path.join(this.directory, `${entry}.${ext}`)

        let content = JSON.stringify(data, null, 4)

        if (this.format === 'yml') {
            content = yaml.dump(data, this.formatOptions)
        }

        fs.writeFileSync(filename, content, 'utf-8')
    }

    public async load() {
        this.clear()

        if (!fs.existsSync(this.directory)) {
            if (this.debug) {
                this.logger.debug(`config directory does not exist, creating: ${this.directory}`)
            }
            
            fs.mkdirSync(this.directory, { recursive: true })
        }

        const files = await fs.promises.readdir(this.directory)

        for (const filename of files) {
            const ext = path.extname(filename)

            if (this.format === 'json' && ext !== '.json') {
                continue
            }

            if (this.format === 'yml' && ext !== '.yml') {
                continue
            }

            const filePath = path.join(this.directory, filename)

            const [error, json] = await tryCatch(async () => {
                const text = await fs.promises.readFile(filePath, 'utf-8')

                if (path.extname(filename) === '.yml') {
                    return yaml.load(text)
                }

                return JSON.parse(text)
            })

            if (error) {
                this.logger.error(`failed to load config file ${filename}`, error)
                continue
            }
            
            const key = path.basename(filename, path.extname(filename))

            super.set(key, json, 'filesystem')

            if (this.debug) {
                this.logger.debug(`loaded config file: ${filename}`)
            }
        }

        if (this.debug) {
            this.logger.debug('config loaded in debug mode')
        }
    }

    private parseKey(fullKey: string) {
        const [entry, ...rest] = fullKey.split('.')

        return {
            entry,
            key: rest.join('.') 
        }
    }

    public set(fullKey: string, value: any, source = 'filesystem'): void {
        super.set(fullKey, value, source)

        if (source !== 'filesystem') {
            return
        }

        const { entry, key } = this.parseKey(fullKey)
        
        let values = this.get(entry)

        if (!key) {
            values = value
        }

        if (key && values) {
            set(values, key, value)
        }

        this.writeSync(entry, values)
        
    }

    public unset(fullKey: string): void {
        const { entry, key } = this.parseKey(fullKey)

        if (!key) {
            const ext = this.format === 'yml' ? 'yml' : 'json'

            const filename = path.join(this.directory, `${entry}.${ext}`)

            fs.unlinkSync(filename)

            super.unset(fullKey)

            return
        }
        
        const values = this.get(entry)

        set(values, key, undefined)

        this.writeSync(entry, values)

        super.unset(fullKey)
    }
}

