import { useRoute as vueUseRoute, useRouter as vueUseRouter, } from 'vue-router'

export const useRoute: typeof vueUseRoute = () => {
  return vueUseRoute()
}

export const useRouter: typeof vueUseRouter = () => {
  return vueUseRouter()
}

