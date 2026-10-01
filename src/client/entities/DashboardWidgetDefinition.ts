import type DashboardWidgetActionSetting from "#client/components/DashboardWidgetActionSetting.vue"
import { defineAsyncComponent } from "vue"

export interface DashboardWidgetAction {
    id: string
    props?: Record<string, any>
    component: () => Promise<any> | any
}

type SettingComponentProps = InstanceType<typeof DashboardWidgetActionSetting>["$props"]

export default class DashboardWidgetDefinition {
    public id: string
    public name: string
    public description?: string
    public icon?: string
    public category?: string

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

    public async boot() {
        // This method can be overridden by plugins to perform any necessary bootstrapping for the widget.
    }

    public defaultOptions() {
        return {}
    }

    public settings(props: SettingComponentProps = {}) {
        const existingAction = this._actions.find(action => action.id === 'settings')

        if (existingAction) {
            const index = this._actions.indexOf(existingAction)
            this._actions.splice(index, 1)
        }

        this.action({
            id: 'settings',
            props: props,
            component: () => defineAsyncComponent(() =>
                import("#client/components/DashboardWidgetActionSetting.vue"),
            ),
        })
    }
}
