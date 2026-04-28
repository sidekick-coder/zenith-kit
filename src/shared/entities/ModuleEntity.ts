import type ModuleManifest from './ModuleManifestEntity.ts'
import LifecycleHook from '#shared/entities/LifecycleHook.ts'
import { compose, mixin } from '#shared/utils/compose.ts'
import BaseEntity from '#shared/mixins/BaseEntityMixin.ts'

interface ModuleUpgradeInfo {
    source: 'git' | 'zip'
    [key: string]: any
}

export default class Module extends compose(BaseEntity, mixin(LifecycleHook)) {
    public id: string
    public name: string
    public enabled: boolean = false
    public dependencies: Record<string, any> = {}
    public build: ModuleManifest['build'] = {}
    public directory: string

    public upgrade_info?: ModuleUpgradeInfo

    public setData(data: Partial<Module | ModuleManifest>) {
        const filtered = Object.fromEntries(
            Object.entries(data).filter(([, v]) => v !== undefined)
        )

        Object.assign(this, filtered)

        this.hook_id = `module:${this.id}`
    }
}
