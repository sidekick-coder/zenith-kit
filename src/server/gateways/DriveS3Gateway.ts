import { Readable } from 'stream'
import { dirname } from 'path'
import ms from 'ms'
import {
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand,
    HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Upload } from '@aws-sdk/lib-storage'
import type { InferOutput } from 'valibot'
import mime from 'mime'
import DriveEntity from '#shared/entities/DriveEntryEntity.ts'
import BaseDrive from '#server/gateways/DriveBaseGateway.ts'
import validator from '#shared/facades/validator.ts'
import BaseException from '#shared/exceptions/BaseException.ts'

const schema = validator.create((v) => v.object({
    bucket: v.pipe(v.string(), v.minLength(1)),
    region: v.optional(v.string()),
    accessKeyId: v.pipe(v.string(), v.minLength(1)),
    secretAccessKey: v.pipe(v.string(), v.minLength(1)),
    sessionToken: v.optional(v.string()),
    endpoint: v.optional(v.string()),
    prefix: v.optional(v.string()),
}))

export type S3DriveConfig = InferOutput<typeof schema>

function streamToUint8Array(stream: any): Promise<Uint8Array> {
    if (!stream || typeof stream !== 'object' || typeof stream.on !== 'function') {
        return Promise.resolve(new Uint8Array())
    }

    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = []
        stream.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)))
        stream.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))))
        stream.on('error', reject)
    })
}

export default class DriveS3 extends BaseDrive {
    private schema = schema

    private _client?: S3Client

    constructor(data: Pick<BaseDrive, 'id' | 'name' | 'description' | 'config'>) {
        super(data)
    }

    public get valid(): boolean {
        return validator.isValid(this.config, this.schema)
    }

    private checkValid(): void {
        if (!this.valid) {
            throw new BaseException($t('Invalid drive configuration'))
        }
    }

    protected get bucket(): string {
        return (this.config as S3DriveConfig).bucket
    }

    protected get prefix(): string {
        if (!this.config?.prefix) return ''

        if (!this.config?.prefix.endsWith('/')) {
            return this.config.prefix + '/'
        }

        return this.config.prefix
    }

    private getKey(filename: string): string {
        const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename
        if (!this.prefix) {
            return cleanFilename
        }
        const cleanPrefix = this.prefix.endsWith('/') ? this.prefix : `${this.prefix}/`
        return `${cleanPrefix}${cleanFilename}`
    }

    protected get client(): S3Client {
        if (this._client) {
            return this._client
        }

        const config = this.config as S3DriveConfig

        this._client = new S3Client({
            region: config.region,
            endpoint: config.endpoint,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
                sessionToken: config.sessionToken,
            }
        })

        return this._client
    }

    public exists: BaseDrive['exists'] = async (filename) => {
        this.checkValid()

        const Key = this.getKey(filename)

        return this.client.send(new HeadObjectCommand({
            Bucket: this.bucket,
            Key
        }))
            .then(() => true)
            .catch(() => false)
    }

    public list: BaseDrive['list'] = async (folder) => {
        this.checkValid()

        let Prefix = folder ? this.getKey(folder) : this.prefix || undefined

        if (Prefix && !Prefix.endsWith('/')) {
            Prefix += '/'
        }

        const command = new ListObjectsV2Command({
            Bucket: this.bucket,
            Prefix,
            Delimiter: '/',
        })

        const resp = await this.client.send(command)

        const entries: DriveEntity[] = []

        const commonPrefixes = resp.CommonPrefixes || []

        for (const prefix of commonPrefixes) {
            let key = prefix.Prefix || ''

            key = key.replace(this.prefix, '')

            if (key.endsWith('/')) {
                key = key.slice(0, -1)
            }

            const entry = new DriveEntity({
                name: key.split('/').pop() || key,
                path: '/' + key,
                type: 'directory',
                metas: {
                    size: 0,
                    mimetype: 'application/x-directory'
                }
            })

            entries.push(entry)
        }

        const contents = resp.Contents || []

        for (const obj of contents) {
            let key = obj.Key || ''

            key = key.replace(this.prefix, '')

            if (key.endsWith('/')) {
                continue
            }

            const entry = new DriveEntity({
                name: key.split('/').pop() || key,
                path: '/' + key,
                type: 'file',
                metas: {
                    size: obj.Size,
                    mimetype: mime.getType(key) || 'application/octet-stream'
                }
            })

            entries.push(entry)
        }

        return entries
    }

    public find: BaseDrive['find'] = async (filename) => {
        this.checkValid()

        const filepath = filename.startsWith('/') ? filename : '/' + filename
        const folder = dirname(filepath)

        const entries = await this.list(folder)

        const entry = entries.find(e => e.path === filepath)

        if (!entry) {
            throw new Error(`File "${filepath}" not found`)
        }

        return entry
    }

    public async mkdir(_filename: string): Promise<void> {
        this.checkValid()

        // S3 is object storage; directories are implicit. Create a zero-byte object with trailing slash to emulate directory if needed.
        return Promise.resolve()
    }

    public read: BaseDrive['read'] = async (filename) => {
        this.checkValid()

        const Key = this.getKey(filename)

        const resp = await this.client.send(new GetObjectCommand({
            Bucket: this.bucket,
            Key
        }))

        const body = resp.Body as Readable

        return streamToUint8Array(body)
    }

    public async readStream(filename: string) {
        this.checkValid()

        const Key = this.getKey(filename)

        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key
        })

        const resp = await this.client.send(command)

        const body = resp.Body as any

        return Promise.resolve(body)
    }

    public write: BaseDrive['write'] = async (filename, data) => {
        this.checkValid()

        const Key = this.getKey(filename)

        await this.client.send(new PutObjectCommand({
            Bucket: this.bucket,
            Key,
            Body: Buffer.from(data)
        }))
    }

    public async writeStream(filename: string, stream: NodeJS.ReadableStream): Promise<void> {
        this.checkValid()

        const Key = this.getKey(filename)

        const upload = new Upload({
            client: this.client,
            params: {
                Bucket: this.bucket,
                Key,
                Body: Readable.from(stream),
            },
        })

        await upload.done()
    }

    public delete: BaseDrive['delete'] = async (filename) => {
        this.checkValid()

        const Key = this.getKey(filename)

        const entry = await this.find(filename)

        if (entry.type === 'file') {
            const command = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key
            })

            await this.client.send(command)

            return
        }


        const listResponse = await this.client.send(new ListObjectsV2Command({
            Bucket: this.bucket,
            Prefix: Key
        }))

        const toDelete = (listResponse.Contents || []).map(c => ({ Key: c.Key }))

        if (toDelete.length === 0) {
            return
        }

        await this.client.send(new DeleteObjectsCommand({
            Bucket: this.bucket,
            Delete: { Objects: toDelete }
        }))

        if (listResponse.IsTruncated) {
            this.delete(filename) // Recursively delete if there are more objects to deleted
        }

        return

    }

    public url: BaseDrive['url'] = async (filename, options) => {
        this.checkValid()

        const Key = this.getKey(filename)

        const expiresMs = ms(options?.expires || '30m') || 30 * 60 * 1000
        const expiresSeconds = Math.max(1, Math.round(expiresMs / 1000))

        return getSignedUrl(this.client, new GetObjectCommand({
            Bucket: this.bucket,
            Key
        }), { expiresIn: expiresSeconds })
    }

    public uploadUrl: BaseDrive['uploadUrl'] = async (filename, options) => {
        this.checkValid()

        const Key = this.getKey(filename)

        const expiresMs = ms(options?.expires || '30m') || 30 * 60 * 1000
        const expiresSeconds = Math.max(1, Math.round(expiresMs / 1000))

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key,
        })

        return getSignedUrl(this.client, command, { expiresIn: expiresSeconds })
    }
}
