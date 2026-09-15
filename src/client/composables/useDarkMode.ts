import { watch } from "vue"
import { useCookie } from "./useCookie"

export function useDarkMode() {

    const darkMode = useCookie<boolean>('dark_mode', {
        parse: (value: string) => value === 'true',
        serialize: (value: boolean) => value ? 'true' : 'false',
        default: () => 'false'
    })

    const isClient = 'window' in globalThis && 'document' in globalThis

    if (isClient) {
        watch(darkMode, (newValue) => {
            if (import.meta.env.SSR) return

            const html = document.documentElement

            if (newValue) {
                html.classList.add('dark')
                return
            }

            html.classList.remove('dark')
        })
    }


    return darkMode

}



