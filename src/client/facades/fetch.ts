import FetchService from '#client/services/FetchService.ts'
import container from './container'

const $fetch = container.proxy<FetchService>(FetchService)

export default $fetch
