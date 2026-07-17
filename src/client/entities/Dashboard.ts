import EmmitterService from '#shared/services/EmmitterService.ts'
import DashboardWidgetData from './DashboardWidgetData'
import DashboardWidget from './DashboardWidget'
import type { DashboardSchema } from '#shared/schemas/dashboardSchema.ts'

export interface DashboardOptions {
    dashboard: DashboardSchema
    widgets?: DashboardWidgetData[]
}

export default class Dashboard {
    public name: DashboardSchema['name'] = ''
    public description: DashboardSchema['description'] = ''
    public widgets: DashboardWidget[] = []
    public emmitter: EmmitterService
    public containerWidth: number = 0

    constructor() {
        this.emmitter = new EmmitterService()
    }

    public setName(name: string) {
        this.name = name
        return this
    }

    public setDescription(description: string) {
        this.description = description
        return this
    }

    public setContainerWidth(width: number) {
        this.containerWidth = width
        return this
    }

    public setWidgets(widgets: DashboardWidgetData[]) {

        this.widgets = []

        for (const w of widgets) {
            const widget = DashboardWidget.fromData(w)

            widget.setEmmitter(this.emmitter)

            this.widgets.push(widget)
        }

        return this
    }

    public findLastRow(): number {
        let result = 0 

        for (const widget of this.widgets) {
            const rows = widget.rows?.base ?? 0
            const y = widget.y?.base ?? 0

            const bottom = y + rows

            if (bottom > result) {
                result = bottom
            }
        }
        
        return result

    }

    public addWidget(payload: Partial<DashboardWidgetData> = {}) {
        if (!payload.columns) {
            payload.columns = { base: 4, }
        }

        if (!payload.rows) {
            payload.rows = { base: 4, }
        }

        if (!payload.x) {
            payload.x = { base: 0, }
        }

        if (!payload.y) {
            payload.y = { base: this.findLastRow(), }
        }

        const data = new DashboardWidgetData(payload)

        const widget = DashboardWidget.fromData(data)

        widget.setEmmitter(this.emmitter)

        this.widgets.push(widget)
    }

    public removeWidget(index: number) {
        this.widgets = this.widgets.filter((_, i) => i !== index)
    }

    public removeWidgetById(id: string) {
        this.widgets = this.widgets.filter((w) => w.id !== id)
    }

    public updateWidget(index: number, widget: DashboardWidget) {
        this.widgets = this.widgets.map((w, i) => i === index ? widget : w)
    }

    public duplicateWidget(index: number) {
        const copy: DashboardWidget = JSON.parse(JSON.stringify(this.widgets[index]))

        const updated = [...this.widgets]

        updated.splice(index + 1, 0, copy)
    }
}
