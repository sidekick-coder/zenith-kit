import BaseException from '#shared/exceptions/BaseException.ts'
import LoggerService from '#shared/services/LoggerService.ts'
import ConfigService from '#shared/services/ConfigService.ts'
import { flatten } from '#shared/utils/flatten.ts'
import type EnvService from './EnvService.ts'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url) 

export interface ConfigManagerOptions {
    env: EnvService
    logger: LoggerService
    silent?: boolean
}

export default class ConfigManagerService {
    public env: EnvService
    public logger: LoggerService
    public silent: boolean

    constructor(options: ConfigManagerOptions) {
        this.env = options.env
        this.logger = options.logger
        this.silent = options.silent ?? false
    }

    public static create(options: ConfigManagerOptions) {
        const service = new ConfigManagerService(options)

        return service
    }

    private async loadS3Config() {
        const ConfigS3Service = await import('#server/services/ConfigS3Service.ts').then(m => m.default)

        const service = new ConfigS3Service({
            bucket: this.env.get('ZENITH_CONFIG_S3_BUCKET')!,
            region: this.env.get('ZENITH_CONFIG_S3_REGION')!,
            accessKeyId: this.env.get('ZENITH_CONFIG_S3_ACCESS_KEY_ID')!,
            secretAccessKey: this.env.get('ZENITH_CONFIG_S3_SECRET_ACCESS_KEY')!,
            debug: this.env.get('ZENITH_CONFIG_DEBUG'),
            endpoint: this.env.get('ZENITH_CONFIG_S3_ENDPOINT'),
            prefix: this.env.get('ZENITH_CONFIG_S3_PREFIX'),
            sessionToken: this.env.get('ZENITH_CONFIG_S3_SESSION_TOKEN'),
            logger: this.logger,
        })

        await service.load()

        if (!this.silent) {
            this.logger.info('using S3 configuration service', {
                bucket: service.bucket,
                region: service.region,
                prefix: service.prefix
            })
        }


        return service
    }

    private async loadFSConfig() {
        const ConfigFSService = await import('#server/services/ConfigFSService.ts').then(m => m.default)

        const service = new ConfigFSService({
            directory: this.env.get('ZENITH_CONFIG_FS_PATH'),
            debug: this.env.get('ZENITH_CONFIG_DEBUG'),
            format: this.env.get('ZENITH_CONFIG_FS_FORMAT')!,
            formatOptions: this.env.get('ZENITH_CONFIG_FS_FORMAT_OPTIONS') || {},
            logger: this.logger,
        })

        await service.load()

        if (!this.silent) {
            this.logger.info('using filesystem configuration service', { path: service.directory })
        }

        return service
    }

    public loadConfigFromEnv(service: ConfigService) {
        for (const [key, value] of Object.entries(flatten(this.env.get('ZENITH_CONFIG') || {}))) {
            service.set(key, value, 'env')
        }

        for (const [key, value] of Object.entries(flatten(this.env.get('ZENITH_CONFIG_ARGUMENTS') || {}))) {
            service.set(key, value, 'argument')
        }
    }

    public loadConfigFromFile(service: ConfigService, file: string) {
        const fs = require('fs') 

        if (!fs.existsSync(file)) {
            this.logger.warn(`configuration file not found: ${file}`)
            return
        }

        const text = fs.readFileSync(file, 'utf-8')
        let data: Record<string, any> | null = null

        if (file.endsWith('.yml') || file.endsWith('.yaml')) {
            const yaml = require('js-yaml')

            data = yaml.load(text) as Record<string, any>
        }

        if (!data) {
            throw new BaseException(`unsupported configuration file format: ${file}`)
        }

        for (const [key, value] of Object.entries(flatten(data))) {
            service.set(key, value, file)
        }
    }

    public loadConfigFromFiles(service: ConfigService, files: string[]) {
        for (const file of files) {
            this.loadConfigFromFile(service, file)
        }
    }

    public async load(): Promise<ConfigService> {
        let service: ConfigService | null = null

        if (this.env.get('ZENITH_CONFIG_DRIVER') === 's3') {
            service = await this.loadS3Config()
        }

        if (!service || this.env.get('ZENITH_CONFIG_DRIVER') === 'fs') {
            service = await this.loadFSConfig()
        }

        if (!service) {
            throw new BaseException('Failed to initialize configuration service: No valid driver found')
        }

        if (!service) {
            throw new BaseException('Failed to initialize configuration service')
        }

        this.loadConfigFromFiles(service, this.env.get('ZENITH_CONFIG_FILES'))

        this.loadConfigFromEnv(service)

        return service
    }
}

