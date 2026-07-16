import { inject, provide } from 'vue'
import type { Ref } from 'vue'
import type DashboardWidget from '#client/entities/DashboardWidget.ts'

const KEY = Symbol('dashboard-widget')

export function provideDashboardWidget(entity: Ref<DashboardWidget>) {
    provide(KEY, entity)
}

export function useDashboardWidget() {
    const entity = inject(KEY)

    if (!entity) {
        throw new Error('useDashboardWidget must be used inside a component that calls provideDashboardWidget')
    }

    return entity as Ref<DashboardWidget>
}
