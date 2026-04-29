import ms from 'ms'
import type DriveEntry from '#shared/entities/DriveEntryEntity.ts'

export interface UrlOptions {
    expires?: ms.StringValue; // ms format, e.g. '1h', '30m', '15s'
}

export interface UploadUrlOptions {
    expires?: ms.StringValue; // ms format, e.g. '1h', '30m', '15s'
    mime_types?: string[];
    max_size?: number;
}

export default class DriveBaseGateway {
    public id: string
    public name: string
    public description?: string
    public config: Record<string, any> = {}

    constructor(data: Pick<DriveBaseGateway, 'id' | 'name' | 'description' | 'config'>) {
        this.id = data.id
        this.name = data.name
        this.description = data.description
        this.config = data.config
    }

    public list(folder?: string): Promise<DriveEntry[]> {
        const error = new Error('Method not implemented.')

        Object.assign(error, { folder })

        throw error
    }
    public find(filename: string): Promise<DriveEntry> {
        const error = new Error('Method not implemented.')

        Object.assign(error, { filename })

        throw error
    }

    public exists(filename: string): Promise<boolean> {
        const error = new Error('Method not implemented.')

        Object.assign(error, { filename })

        throw error
    }

    public read(filename: string): Promise<Uint8Array> {
        const error = new Error('Method not implemented.')

        Object.assign(error, { filename })

        throw error
    }

    public readStream(filename: string): Promise<NodeJS.ReadableStream> {
        const error = new Error('Method not implemented.')

        Object.assign(error, { filename })

        throw error
    }

    public write(filename: string, data: Uint8Array): Promise<void> {
        const error = new Error('Method not implemented.')

        Object.assign(error, { 
            filename,
            data 
        })

        throw error
    }

    public writeStream(filename: string, stream: NodeJS.ReadableStream): Promise<void> {
        const error = new Error('Method not implemented.')

        Object.assign(error, { 
            filename,
            stream 
        })

        throw error
    }

    public delete(filename: string): Promise<void> {
        const error = new Error('Method not implemented.')

        Object.assign(error, { filename })

        throw error
    }

    public url(filename: string, options?: UrlOptions): Promise<string> {
        const error = new Error('Method not implemented.')

        Object.assign(error, { 
            filename,
            options 
        })

        throw error
    }

    public uploadUrl(filename: string, options?: UploadUrlOptions): Promise<string> {
        const error = new Error('Method not implemented.')

        Object.assign(error, { 
            filename,
            options 
        })

        throw error
    }
    
}
