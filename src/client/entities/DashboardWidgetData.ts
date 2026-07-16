import { createId } from '#shared/utils/index.ts'

export interface DashboardGridUnit {
    base?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
}

export default class DashboardWidgetData {
    public id: string
    public name: string
    public definition_id: string
    public columns: DashboardGridUnit 
    public rows: DashboardGridUnit
    public x: DashboardGridUnit
    public y: DashboardGridUnit
    public order: number
    public options: Record<string, any>

    constructor(data: Partial<DashboardWidgetData>) {
        Object.assign(this, data)

        if (!this.id) {
            this.id = createId()
        }

        if (!this.options) {
            this.options = {}
        }
    }
}
