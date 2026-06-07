
import container from '#client/facades/container.ts'
import * as Vue from 'vue'

export const VUE_CONTAINER_KEY = 'Vue'

const vue = container.proxy<typeof Vue>(VUE_CONTAINER_KEY)

export default vue
