import { set } from 'lodash-es'
import { defineLoader } from '#server/utils/defineLoader.ts'
import File from '#server/entities/FileEntity.ts'

interface FileLoaderOptions {
    fileIdProperty?: string
    fileUrlProperty?: string
}

export async function loadFileUrl<T extends Record<string, any>>(entities: T[], options?: FileLoaderOptions) {
    const fileIdProperty = options?.fileIdProperty || 'file_id'
    const fileUrlProperty = options?.fileUrlProperty || 'url'
    const fileIds = entities.map(e => e[fileIdProperty] as number).filter(Boolean)

    if (!fileIds.length) {
        return
    }

    const files = await File.list({ where: (eb) => eb('id', 'in', fileIds) })

    await Promise.all(files.map(async (file) => file.loadUrl()))

    for (const entity of entities) {
        const file = files.find(f => f.id === entity[fileIdProperty])

        if (file) {
            set(entity, fileUrlProperty, file.url)
        }
    }
}

export function createFileUrlLoader<T extends Record<string, any>>(options?: FileLoaderOptions) {
    return defineLoader<T>({
        load: (entities) => loadFileUrl(entities, options),
    })
}
