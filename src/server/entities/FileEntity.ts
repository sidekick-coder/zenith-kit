import ms from 'ms'
import Base from '#shared/entities/FileEntity.ts'
import drive from '#server/facades/drive.ts'
import type { DriveUrlOptions } from '#server/contracts/DriveContract.ts'

interface URLCache {
    url: string
    expires: number
}

export default class File extends Base {

    public static cache = new Map<string, URLCache>()

    public readStream() {
        return drive.use(this.drive).readStream(this.filename)
    }

    public async read() {
        return await drive.use(this.drive).read(this.filename)
    }

    public async loadUrl(options: DriveUrlOptions = {}) {
        const cache = File.cache.get(this.filename)
        const now = Date.now()

        if (cache && now < cache.expires) {
            this.url = cache.url
            return
        }

        if (!options.expires) {
            options.expires = '1h'
        }

        this.url = await drive.use(this.drive).url(this.filename, options)

        if (!this.url) {
            return
        }

        const expires = now + ms(options.expires) - 1000 // 1 second early

        File.cache.set(this.filename, {
            url: this.url,
            expires
        })
    }

    public static async loadUrls(items: File[], options: DriveUrlOptions = {}) {
        const now = Date.now()
        for (const item of items) {

            const cache = this.cache.get(item.filename)

            if (cache && now < cache.expires) {
                item.url = cache.url
                continue
            }


            await item.loadUrl(options)
        }
    }

    public async deleteFromDrive() {
        await drive.use(this.drive).delete(this.filename)
    }
}
