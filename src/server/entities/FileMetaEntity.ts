import ModelMixin from '#server/mixins/ModelMixin.ts'
import BaseMeta from '#shared/entities/FileMetaEntity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class FileMeta extends composeWith(
    BaseMeta,
    ModelMixin('file_metas')
) {

}
