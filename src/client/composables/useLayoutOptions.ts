import emmitter from "#client/facades/emmitter.ts"
import layout from "#client/facades/layout.ts"
import { ref } from "vue"

export function useLayoutOptions() {
    const options = ref(layout.getOptions())

    const refresh = () => {
        options.value = layout.getOptions()
    }

    emmitter.on('layout:change', refresh)
    emmitter.on('layout:set-options', refresh)

    return options
}
