import ms from 'ms'
import FileMeta from './FileMetaEntity.ts'
import Base from '#shared/entities/FileEntity.ts'
import { composeWith } from '#shared/utils/compose.ts'
import Metadata from '#server/mixins/MetadataMixin.ts'
import drive from '#server/facades/drive.ts'
import HooksStatic from '#shared/mixins/HooksMixin.ts'
import type { DriveUrlOptions } from '#server/contracts/DriveContract.ts'
import MetadataService from '#server/services/MetadataService.ts'
import HasMetas from '#server/relations/HasMetasRelation.ts'
import Relation from '#server/mixins/RelationsMixin.ts'
import ModelMixin from '#server/mixins/ModelMixin.ts'

interface URLCache {
    url: string
    expires: number
}

const FileRelations = {
    metas: new HasMetas({
        table: 'files',
        tableKey: 'id',

        targetTable: 'file_metas',
        targetKey: 'file_id',

        property: 'metas',
    })
}

export default class File extends composeWith(
    Base,
    HooksStatic,
    ModelMixin('files'),
    Relation(FileRelations),
    Metadata('file_metas', 'file_id')
) {

    public static cache = new Map<string, URLCache>()

    public static async has(filename: string): Promise<boolean> {
        const exists = await this.exists({
            query: q => q.where('filename', '=', filename)
        })

        return exists
    }

    public static async findByFilename(filename: string) {
        return await this.findOne({
            where: qb => qb('filename', '=', filename)
        })
    }

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

    public static async loadMetas(items: File[]){
        const ids = items.map(i => i.id)
    
        if (!ids.length) return
    
        const rows = await FileMeta.list({
            query: q => q.selectAll().where('file_id', 'in', ids)
        })
    
        items.forEach(f => {
            f.metas = MetadataService.flatten(rows.filter(r => r.file_id === f.id))
        })
    }

    public async deleteFromDrive() {
        await drive.use(this.drive).delete(this.filename)
    }
}
