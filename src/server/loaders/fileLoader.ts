import { set } from 'lodash-es'
import { defineLoader } from '#server/utils/defineLoader.ts'
import File from '#server/entities/FileEntity.ts'

interface FileLoaderOptions {
    fileIdProperty: string
    fileProperty: string
}

export function createFileLoader<T extends Record<string, any>>(options: FileLoaderOptions) {
    return defineLoader<T>({

        async load(entities: T[]) {
            const { fileIdProperty, fileProperty } = options 

            const fileIds = entities.map(e => e[fileIdProperty] as number).filter(Boolean)

            if (!fileIds.length) {
                return
            }

            const files = await File.list({ where: (eb) => eb('id', 'in', fileIds) })

            for (const entity of entities) {
                const file = files.find(f => f.id === entity[fileIdProperty])

                if (file) {
                    set(entity, fileProperty, file)
                }
            }

        }
    })
}
