
import container from '#client/facades/container.ts'
import * as VueRouter from 'vue-router'

export const VUE_ROUTER_CONTAINER_KEY = 'VueRouter'

const vueRouter = container.proxy<typeof VueRouter>(VUE_ROUTER_CONTAINER_KEY)

export default vueRouter
