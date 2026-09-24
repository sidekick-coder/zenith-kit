import type DashboardWidgetActionSetting from "#client/components/DashboardWidgetActionSetting.vue"
import { defineAsyncComponent } from "vue"

export interface DashboardWidgetAction {
    props?: Record<string, any>
    component: () => Promise<any> | any
}

type SettingComponentProps = InstanceType<typeof DashboardWidgetActionSetting>["$props"]

export default class DashboardWidgetDefinition {
    public id: string
    public name: string
    public description?: string
    public icon?: string

    public _actions: DashboardWidgetAction[] = []

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
        return this._actions
    }


    public action(action: DashboardWidgetAction) {
        this._actions.push(action)
    }

    public actionComponent(component: DashboardWidgetAction['component'], props: Record<string, any> = {}) {
        this.action({
            props: props,
            component: component,
        })
    }

    public settings(props: SettingComponentProps = {}) {
        this.action({
            props: props,
            component: () => defineAsyncComponent(() =>
                import("#client/components/DashboardWidgetActionSetting.vue"),
            ),
        })
    }
}
