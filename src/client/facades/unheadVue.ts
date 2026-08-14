import container from '#client/facades/container.ts'
import * as UnheadVue from '@unhead/vue'

export const UNHEAD_VUE_CONTAINER_KEY = 'unhead-vue'

const unheadVue = container.proxy<typeof UnheadVue>(UNHEAD_VUE_CONTAINER_KEY)

export default unheadVue
