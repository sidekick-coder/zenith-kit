import { compose } from '#shared/utils/compose.ts'
import BaseEntity from '#shared/mixins/BaseEntityMixin.ts'

export default class PluginEntity extends compose(BaseEntity) {
    public id: string
    public name: string
    public version: string
    public enabled: boolean
    public aliases: string[]
}
