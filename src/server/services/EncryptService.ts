import crypto from 'crypto'
import ms from 'ms'
import { format } from 'date-fns'
import EnvService from './EnvService';
import LoggerService from '#shared/services/LoggerService.ts';

interface URLOptions {
    data?: any;
    expires?: ms.StringValue;
    expireAt?: number | Date;
}

interface EncryptServiceOptions {
    key?: string;
    debug?: boolean;
    logger?: LoggerService;
    env?: EnvService;
}

export default class EncryptService {
    public static __container_entry_key = 'EncryptService' 

    public debug = false
    public env: EnvService
    public logger: LoggerService

    private readonly algorithm = 'aes-256-cbc'
    private key: Buffer | null = null

    constructor(options: EncryptServiceOptions) {
        this.env = options.env || new EnvService()
        this.logger = options.logger || new LoggerService()
        this.debug = options.debug || false 
        this.key = options.key ? Buffer.from(options.key, 'hex') : null
    }

    public static create(options: EncryptServiceOptions) {
        return new EncryptService(options)
    }

    public setDebug(debug: boolean) {
        this.debug = debug

        if (this.debug) {
            this.logger.debug('debug mode enabled')
        }
    }

    public setLogger(logger: LoggerService) {
        this.logger = logger
    }

    public setEnv(env: EnvService) {
        this.env = env
    }

    public setKey(key: string) {
        this.key = Buffer.from(key, 'hex')
    }


    public encrypt(text: string) {
        if (!this.key) {
            throw new Error('Encryption key not set')
        }

        const iv = crypto.randomBytes(16)
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv)

        let encrypted = cipher.update(text, 'utf8', 'hex')
        encrypted += cipher.final('hex')

        return `${iv.toString('hex')}:${encrypted}`
    }



    public decrypt(options: string): string {
        if (!this.key) {
            throw new Error('Encryption key not set in configuration (app.key).')
        }

        const [iv, encrypted] = options.split(':')

        const ivBuffer = Buffer.from(iv, 'hex')

        const decipher = crypto.createDecipheriv(this.algorithm, this.key, ivBuffer)

        let decrypted = decipher.update(encrypted, 'hex', 'utf8')
        decrypted += decipher.final('utf8')

        return decrypted
    }

    public encryptObject(obj: any): string {
        const jsonString = JSON.stringify(obj)

        return this.encrypt(jsonString)
    }

    public decryptObject<T>(encryptedString: string): T {
        const jsonString = this.decrypt(encryptedString)

        return JSON.parse(jsonString) as T
    }

    public url(path: string, options?: URLOptions): string {
        let expireAt = options?.expireAt

        if (options?.expires) {
            const expires = ms(options.expires) as number

            expireAt = Date.now() + expires
        }

        if (!expireAt) {
            expireAt = Date.now() + ms('15 minutes')
        }

        if (expireAt instanceof Date) {
            expireAt = expireAt.getTime()
        }

        const payload = {
            data: options?.data || {},
            expireAt,
            expireAtReadable: format(new Date(expireAt), 'yyyy-MM-dd HH:mm:ss')
        }

        const key = this.encrypt(JSON.stringify(payload))

        const url = new URL(path, env.get('APP_URL'))

        url.searchParams.append('key', encodeURIComponent(key))

        return url.toString()
    }

    public verifyUrl(encryptedKey: string): any {
        const decryptedData = this.decrypt(decodeURIComponent(encryptedKey))

        const payload = JSON.parse(decryptedData)

        if (payload.expireAt && Date.now() > payload.expireAt) {
            const error = new BaseException('URL has expired', 403)

            Object.assign(error, {
                expireAt: payload.expireAt,
                expireAtReadable: payload.expireAtReadable
            })

            throw error
        }

        return payload.data
    }
}
