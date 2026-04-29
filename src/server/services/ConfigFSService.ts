
import fs from 'fs'
import path from 'path'
import { set } from 'lodash-es'
import { basePath } from '#server/utils/basePath.ts'
import ConfigService from '#shared/services/ConfigService.ts'
import LoggerService from '#shared/services/LoggerService.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

interface InitiOptions {
    directory?: string
    debug?: boolean
    logger?: LoggerService
}

export default class ConfigFSService extends ConfigService {
    public directory: string
    public logger: LoggerService
    public debug = false

    constructor(options: InitiOptions = {}) {
        super()
        this.debug = options.debug ?? false
        this.directory = options.directory ?? basePath('config')
        this.logger = options.logger ?? new LoggerService()

        if (this.debug) {
            this.logger.debug('service initialized in debug mode')
        }
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
            if (!filename.endsWith('.json')) {
                continue
            }

            const filePath = path.join(this.directory, filename)

            const [error, json] = await tryCatch(async () => {
                const text = await fs.promises.readFile(filePath, 'utf-8')
                
                return JSON.parse(text)
            })

            if (error) {
                this.logger.error(`failed to load config file ${filename}`, error)
                continue
            }
            
            const key = path.basename(filename, '.json')

            super.set(key, json, 'filesystem')

            if (this.debug) {
                this.logger.debug(`loaded config file: ${filename}`)
            }
        }

        if (this.debug) {
            this.logger.debug('config loaded in debug mode')
        }
    }

    private parseKey(fullKey: string): { filename: string; key: string } {
        const [filename, ...rest] = fullKey.split('.')

        return {
            filename,
            key: rest.join('.') 
        }
    }

    public set(fullKey: string, value: any, source = 'filesystem'): void {
        super.set(fullKey, value, source)

        if (source !== 'filesystem') {
            return
        }

        const { filename, key } = this.parseKey(fullKey)
        
        let values = this.get(filename)

        if (!key) {
            values = value
        }

        if (key && values) {
            set(values, key, value)
        }
        
        const filePath = path.join(this.directory, `${filename}.json`)

        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true })
        }

        fs.writeFileSync(filePath, JSON.stringify(values, null, 4))
    }

    public unset(fullKey: string): void {
        const { filename, key } = this.parseKey(fullKey)
        
        const values = this.get(filename)

        set(values, key, undefined)

        const filePath = path.join(this.directory, `${filename}.json`)

        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true })
        }

        fs.writeFileSync(filePath, JSON.stringify(values, null, 4))

        super.unset(fullKey)

    }
}
