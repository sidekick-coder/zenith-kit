import type { RequestInit } from 'undici'
import { fetch, ProxyAgent } from 'undici'
import BaseException from '#shared/exceptions/BaseException.ts'

export interface DownloadedFetchOptions extends RequestInit {
    proxy?: string
}

export default class DownloadService {
    public async fetch(url: string, options?: DownloadedFetchOptions) {
        const fetchOptions = options || {}

        if (options?.proxy) {
            fetchOptions.dispatcher  = new ProxyAgent(options.proxy)
        }

        console.log('Downloading from URL:', url, 'with options:', fetchOptions)

        return await fetch(url, fetchOptions)

    }

    public async stream(url: string, options?: DownloadedFetchOptions) {
        const response = await this.fetch(url, options)
    
        if (!response.ok) {
            const error = new BaseException('Failed to download', 400)
            
            Object.assign(error, { 
                status: response.status, 
                statusText: response.statusText 
            })

            throw error
        }
    
        if (!response.body) {
            throw new BaseException('No body', 400)
        }
    
        const contentType = response.headers.get('content-type') || 'application/octet-stream'
    
        return {
            stream: response.body as unknown as NodeJS.ReadableStream,
            contentType
        }
    }
}
