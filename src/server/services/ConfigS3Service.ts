import { set } from 'lodash-es'
import ConfigService from '#shared/services/ConfigService.ts'
import LoggerService from '#shared/services/LoggerService.ts'
import S3Drive from '#server/gateways/DriveS3Gateway.ts'
import type { S3DriveConfig } from '#server/gateways/DriveS3Gateway.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

interface InitiOptions extends Omit<S3DriveConfig, 'name' | 'description'> {
    prefix?: string
    debug?: boolean
    logger?: LoggerService
}

export default class ConfigS3Service extends ConfigService {
    public prefix = ''
    public logger: LoggerService
    public debug = false
    public drive: S3Drive
    public bucket: string
    public region: string
    public endpoint?: string

    constructor(options: InitiOptions) {
        super()

        this.debug = options.debug ?? false
        this.prefix = options.prefix ?? ''
        this.bucket = options.bucket
        this.region = options.region || ''
        this.endpoint = options.endpoint
        this.logger = options.logger ?? new LoggerService()

        this.drive = new S3Drive({
            id: 'config-s3',
            name: 'config-s3',
            config: {
                bucket: options.bucket,
                region: options.region,
                accessKeyId: options.accessKeyId,
                secretAccessKey: options.secretAccessKey,
                sessionToken: options.sessionToken,
                endpoint: options.endpoint,
            }
        })

        if (this.debug) {
            this.logger.debug('service initialized in debug mode')
        }
    }

    private parseKey(fullKey: string): { filename: string; key: string } {
        const [filename, ...rest] = fullKey.split('.')

        return {
            filename,
            key: rest.join('.')
        }
    }

    public async load() {
        this.clear()

        const prefix = this.prefix.replace(/^\/|\/$/g, '')

        const entries = await this.drive.list(prefix || undefined)

        for (const entry of entries) {
            if (!entry.name.endsWith('.json')) {
                continue
            }

            const filename = entry.name

            const filepath = prefix ? `${prefix}/${filename}` : filename

            const [error, data] = await tryCatch(async () => {
                const buf = await this.drive.read(filepath)

                const text = Buffer.from(buf).toString('utf-8')

                return JSON.parse(text)
            })

            if (error) {
                this.logger.error(`failed to load config file ${filename}`, error)
                continue
            }

            const key = filename.replace(/\.json$/, '')

            super.set(key, data)

            if (this.debug) {
                this.logger.debug(`loaded config file: ${filename}`)
            }
        }

        if (this.debug) {
            this.logger.debug('config loaded in debug mode')
        }
    }

    public set(fullKey: string, value: any, source = 's3'): void {
        super.set(fullKey, value, source)

        if (source !== 's3') {
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

        const cleanPrefix = this.prefix.replace(/^\/|\/$/g, '')

        const filePath = cleanPrefix ? `${cleanPrefix}/${filename}.json` : `${filename}.json`

        const body = Buffer.from(JSON.stringify(values, null, 4))

        this.drive.write(filePath, body as unknown as Uint8Array).catch(err => {
            this.logger.error('failed to write config to s3', err)
        })
    }

    public unset(fullKey: string): void {
        const cleanPrefix = this.prefix.replace(/^\/|\/$/g, '')

        if (!fullKey.includes('.')) {
            const filePath = cleanPrefix ? `${cleanPrefix}/${fullKey}.json` : `${fullKey}.json`

            this.drive.delete(filePath)
                .catch(err => {
                    this.logger.error('failed to delete config from s3', err)
                })
            return
        }

        const { filename, key } = this.parseKey(fullKey)

        const values = this.get(filename)

        set(values, key, undefined)


        const filePath = cleanPrefix ? `${cleanPrefix}/${filename}.json` : `${filename}.json`

        this.drive.write(filePath, Buffer.from(JSON.stringify(values, null, 4)) as unknown as Uint8Array).catch(err => {
            this.logger.error('failed to write config to s3', err)
        })

        super.unset(fullKey)
    }
}
