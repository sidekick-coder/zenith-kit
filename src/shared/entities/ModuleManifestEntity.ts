import BaseEntity from '#shared/mixins/BaseEntityMixin.ts'
import { compose } from '#shared/utils/compose.ts'

export interface ModuleManifestBuildImport {
    from: string
    to?: string
    type: 'global_import'
}
export interface ModuleManifestBuild {
    imports?: ModuleManifestBuildImport[]
}

export default class ModuleManifest extends compose(BaseEntity) {
    public id: string
    public name: string
    public version: string
    public description?: string
    public enabled: boolean
    public author?: string
    public dependencies?: Record<string, string>
    public build?: ModuleManifestBuild
    [key: string]: any
}
