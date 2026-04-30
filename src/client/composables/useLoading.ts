import { computed, ref  } from 'vue'
import type { Ref } from 'vue'

interface Options {
    timeout?: number
}

interface LoadingRef extends Ref<boolean> {
    set: (value: boolean) => void
}

export function useLoading(defaultValue = false, options?: Options) {
    const state = ref(defaultValue)
    const timeout = ref(options?.timeout ?? 500)

    function set(value: boolean) {
        state.value = value
    }

    const loading = computed({
        get() {
            return state.value
        },
        set(value: boolean) {
            if (value) {
                state.value = true
                return
            } 

            setTimeout(() => set(false), timeout.value)
        }
    })

    const loadingRef: LoadingRef = Object.assign(loading, { set })

    return loadingRef

}
