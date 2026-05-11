import fs from 'fs'
import path, { join, relative } from 'path'
import mime from 'mime'
import DriveEntity from '#shared/entities/DriveEntryEntity.ts'
import BaseDrive from '#server/gateways/DriveBaseGateway.ts'
import validator from '#shared/facades/validator.ts'
import encrypt from '#server/facades/encrypt.ts'
import BaseException from '#shared/exceptions/BaseException.ts'
import { basePath } from '#server/utils/basePath.ts'

export interface DriveFSConfig {
    directory: string
}

export default class DriveFS extends BaseDrive {
    private schema = validator.create((v) => v.object({
        directory: v.pipe(v.string(), v.minLength(1)),
    }))

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

        if (!fs.existsSync(this.rootPath)) {
            throw new BaseException($t('Drive root path does not exist'))
        }
    }

    protected get rootPath(): string {
        return basePath(this.config.directory as string)
    }

    public exists: BaseDrive['exists'] = async (filename) => {
        this.checkValid()
        
        return fs.promises.access(join(this.rootPath, filename))
            .then(() => true)
            .catch(() => false)
    }

    public list: BaseDrive['list'] = async (folder) => {
        this.checkValid()
        
        const filepath = folder ? join(this.rootPath, folder) : this.rootPath

        if (!(await this.exists(relative(this.rootPath, filepath)))) {
            return []
        }

        const files = await fs.promises.readdir(filepath)

        const entries: DriveEntity[] = []

        for (const filename of files) {
            const filePath = join(filepath, filename)

            const stats = await fs.promises.stat(filePath)

            const metas: any = {}

            if (stats.isFile()) {
                metas.size = stats.size
                metas.mimetype = mime.getType(filename) || 'application/octet-stream'
            }
            
            const entry = new DriveEntity({
                name: filename,
                path: '/' + relative(this.rootPath, filePath),
                type: stats.isDirectory() ? 'directory' : 'file',
                metas
            })

            entries.push(entry)
        }

        return entries
    }

    public find: BaseDrive['find'] = async (filename) => {
        this.checkValid()
        
        const filepath = filename.startsWith('/') ? filename : '/' + filename

        const entries = await this.list(path.dirname(filepath))

        const entry = entries.find(e => e.path === filepath)

        if (!entry) {
            throw new Error(`File "${filepath}" not found`)
        }

        return entry
    }

    public async mkdir(filename: string): Promise<void> {
        this.checkValid()
        
        if (!(await this.exists(path.dirname(filename)))) {
            await this.mkdir(path.dirname(filename))
        }

        const filepath = join(this.rootPath, filename)

        await fs.promises.mkdir(filepath, { recursive: true })
    }

    public read: BaseDrive['read'] = async (filename) => {
        this.checkValid()
        
        const filePath = join(this.rootPath, filename)
        
        const buffer = await fs.promises.readFile(filePath)
        
        return new Uint8Array(buffer)
    }

    public async readStream(filename: string) {
        this.checkValid()
        
        const filePath = join(this.rootPath, filename)
        
        const stream = fs.createReadStream(filePath)
        
        return Promise.resolve(stream)
    }

    public write: BaseDrive['write'] = async (filename, data) => {
        this.checkValid()
        
        if (!await this.exists(path.dirname(filename))) {
            await this.mkdir(path.dirname(filename))
        }

        const filePath = join(this.rootPath, filename)

        await fs.promises.writeFile(filePath, data)
    }

    public async writeStream(filename: string, stream: NodeJS.ReadableStream): Promise<void> {
        this.checkValid()
        
        if (!await this.exists(path.dirname(filename))) {
            await this.mkdir(path.dirname(filename))
        }
        
        const filePath = join(this.rootPath, filename)

        return new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(filePath)

            stream.pipe(writeStream)

            writeStream.on('finish', resolve)
            writeStream.on('error', reject)
        })
    }

    public delete: BaseDrive['delete'] = async (filename) => {
        this.checkValid()
        
        const filePath = join(this.rootPath, filename)

        const isDirectory = await fs.promises.stat(filePath)
            .then(stat => stat.isDirectory())
            .catch(() => false)

        if (isDirectory) {
            await fs.promises.rmdir(filePath, { recursive: true })
            return
        }

        await fs.promises.unlink(filePath)
    }

    public url: BaseDrive['url'] = async (filename, options) => {
        this.checkValid()
        
        const filepath = filename.startsWith('/') ? filename : `/${filename}`

        return encrypt.url(`/api/drives/${this.id}/stream${filepath}`, {
            expires: options?.expires || '30m'
        })
    }

    public uploadUrl: BaseDrive['uploadUrl'] = async (filename, options) => {
        this.checkValid()
        
        const filepath = filename.startsWith('/') ? filename : `/${filename}`

        return encrypt.url(`/api/drives/${this.id}/upload${filepath}`, {
            expires: options?.expires || '30m',
            data: {
                mime_types: options?.mime_types,
                max_size: options?.max_size,
            }
        })
    }
}
