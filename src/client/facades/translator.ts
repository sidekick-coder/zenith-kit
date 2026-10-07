import container from '#client/facades/container.ts'
import TranslatorService from '#shared/services/TranslatorService.ts'

const translator = container.proxy<TranslatorService>(TranslatorService)

export const $t: TranslatorService['t'] = (...args) => {
    return translator.t(...args)
}

export const $d: TranslatorService['date'] = (...args) => {
    return translator.date(...args)
}

export const $dt: TranslatorService['datetime'] = (...args) => {
    return translator.datetime(...args)
}

export default translator

