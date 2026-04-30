import BaseEntity from '#shared/mixins/BaseEntityMixin.ts'
import { compose } from '#shared/utils/compose.ts'

export default class MenuItem extends compose(BaseEntity) {
    public id: string
    public label: string
    public layout: string

    public to?: string

    public target?: '_blank' | '_self' | '_parent' | '_top'
    public group?: string
    public order?: number
    public icon?: string
    public parent?: string
}
