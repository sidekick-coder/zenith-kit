import unheadVue from '#client/facades/unheadVue.ts'

const zenithUseHead = (...args: any) => {
    return unheadVue.useHead(...args)
}

export const useHead = zenithUseHead as typeof unheadVue.useHead

