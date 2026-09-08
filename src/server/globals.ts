import type ContainerService from '#shared/services/ContainerService.ts'
import type { tryCatch } from '#shared/utils/tryCatch.ts'
import type TranslatorService from '#shared/services/TranslatorService.ts'

export { }

declare global {
    var serverContainer: ContainerService | undefined
    var $t: TranslatorService['t']
    var $dt: TranslatorService['datetime']
    var $d: TranslatorService['date']
    var $translator: TranslatorService
    var $try: typeof tryCatch
}
