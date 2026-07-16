import type DashboardWidgetDefinition from '#client/entities/DashboardWidgetDefinition.ts'

export default class DashboardWidgetRegistry {
    public static __container_entry_key = 'DashboardWidgetRegistry'
    private definitions: Map<string, DashboardWidgetDefinition> = new Map()

    public register(...definition: DashboardWidgetDefinition[]) {
        for (const def of definition) {
            this.definitions.set(def.id, def)
        }
    }

    public get(id: string): DashboardWidgetDefinition | null {
        return this.definitions.get(id) || null
    }

    public list(): DashboardWidgetDefinition[] {
        return Array.from(this.definitions.values())
    }
}
