import { container } from '@sidekick-coder/zenith-kit/client'
import { TranslatorService } from '@sidekick-coder/zenith-kit/shared'

const translator = container.proxy<TranslatorService>(TranslatorService)

export const $t: TranslatorService['t'] = (key, args = {}) => {
    return translator.t(key, args)
}

export default translator
