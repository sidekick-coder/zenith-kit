import { inject, provide } from 'vue'
import type { Ref } from 'vue'
import type DashboardEntity from '#client/entities/Dashboard.ts'

const DASHBOARD_KEY = Symbol('dashboard')

export function provideDashboard(entity: Ref<DashboardEntity>) {
    provide(DASHBOARD_KEY, entity)
}

export function useDashboard() {
    const entity = inject<Ref<DashboardEntity | undefined>>(DASHBOARD_KEY)

    if (!entity) {
        throw new Error('useDashboard must be used inside a component that calls provideDashboard')
    }

    return entity as Ref<DashboardEntity>
}
