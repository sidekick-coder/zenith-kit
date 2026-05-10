import FetchService from '#client/services/FetchService.ts'
import container from './container'

const fetcher = container.proxy<FetchService>(FetchService)

export default fetcher
