import container from '#server/facades/container.ts'
import SchedulerService from '#server/services/SchedulerService.ts'

const scheduler = container.proxy<SchedulerService>(SchedulerService)

export default scheduler
