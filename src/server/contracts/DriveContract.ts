import type { ReadStream } from 'fs'
import type ms from 'ms'
import type DriveEntry from '#shared/entities/DriveEntryEntity.ts'

export interface DriveUrlOptions {
    expires?: ms.StringValue; // ms format, e.g. '1h', '30m', '15s'
}

export interface DriveUploadUrlOptions {
    expires?: ms.StringValue; // ms format, e.g. '1h', '30m', '15s'
    mime_types?: string[];
    max_size?: number;
}

export interface DriveContract {
    id: string;
    name: string;
    description?: string;
    list(folder?: string): Promise<DriveEntry[]>;
    find(filename: string): Promise<DriveEntry>;
    exists(filename: string): Promise<boolean>;
    read(filename: string): Promise<Uint8Array>;
    write(filename: string, data: Uint8Array): Promise<void>;
    writeStream(filename: string, stream: NodeJS.ReadableStream): Promise<void>;
    delete(filename: string): Promise<void>;
    url(filename: string, options?: DriveUrlOptions): Promise<string>;
    uploadUrl(filename: string, options?: DriveUploadUrlOptions): Promise<string>;
    readStream(filename: string): Promise<ReadStream>;
}
