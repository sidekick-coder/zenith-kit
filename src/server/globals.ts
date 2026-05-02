import type { ContainerService, tryCatch } from '#shared/index.ts'
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
