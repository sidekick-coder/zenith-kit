import { useHead as unheadUseHead, useSeoMeta as unheadUseSeoMeta } from '@unhead/vue'

const zenithUseHead = (...args: any) => {
    return unheadUseHead(...args)
}

const zenithUseSeoMeta = (...args: any) => {
    return unheadUseSeoMeta(...args)
}

export const useHead = zenithUseHead as typeof unheadUseHead
export const useSeoMeta= zenithUseSeoMeta as typeof unheadUseSeoMeta

