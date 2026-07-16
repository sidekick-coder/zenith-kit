import DashboardWidgetRegistry from '#client/registry/DashboardWidgetRegistry.ts'
import container from './container'

const dashboardRegistry = container.proxy<DashboardWidgetRegistry>(DashboardWidgetRegistry)

export default dashboardRegistry
