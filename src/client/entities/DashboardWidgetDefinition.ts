export interface DashboardWidgetAction {
    props?: Record<string, any>
    component: any
}

export default class DashboardWidgetDefinition {
    public id: string
    public name: string
    public description?: string
    public icon?: string

    constructor() {
        this.id = ''
        this.name = ''
        this.description = ''
        this.icon = ''
    }

    public component(): any {
        return null
    }

    public actions(): DashboardWidgetAction[] {
        return []
    }
}
