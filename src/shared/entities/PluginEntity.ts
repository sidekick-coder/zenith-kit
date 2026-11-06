import { compose } from '#shared/utils/compose.ts'
import BaseEntity from '#shared/mixins/BaseEntityMixin.ts'
import LoggerService from '#shared/services/LoggerService.ts'

interface PluginEntityBransh {
    branch: string
    label?: string
    main?: boolean
}

export default class PluginEntity extends compose(BaseEntity) {
    public id: string
    public name: string
    public version: string
    public developmentMode: boolean
    public enabled: boolean
    public aliases: string[]
    public branches: PluginEntityBransh[]

    public logger: LoggerService = new LoggerService()

    public setLogger(logger: LoggerService) {
        this.logger = logger
        return this
    }
}
