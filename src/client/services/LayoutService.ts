import { BaseException } from "#shared/index.ts"
import type { DefineComponent } from "vue"
import emmitter from '../facades/emmitter.ts'

export default class LayoutService {
    public static __container_entry_key = 'LayoutService'
    public components: Map<string, DefineComponent> = new Map()
    public options: Record<string, any> = {}
    public currendId: string | null = null

    public setCurrent(id: string) {
        this.currendId = id

        emmitter.emit('layout:change', id)
    }

    public add(name: string, component: DefineComponent, options?: any) {
        this.components.set(name, component)
        this.options = options || {}
    }

    public has(name: string) {
        return this.components.has(name)
    }

    public get(name: string) {
        const entry = this.components.get(name)

        if (!entry) {
            throw new BaseException(`Layout ${name} not found`)
        }

        return entry
    }

    public getOptions() {
        return this.options
    }

    public getCurrent() {
        if (!this.currendId) {
            return null
        }

        return this.get(this.currendId)
    }

    public setOptions(options: any = {}) {
        this.options = options

        emmitter.emit('layout:set-options', options)
    }
}
