import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { computed } from 'vue'
import di from '#client/utils/di.ts'

export interface UseStateOptions {
    default?: () => any
    transform?: (value: any) => any
}

export function useState<T>(key: string, options?: UseStateOptions): Ref<T> {
    const refs = di.get<Record<string, any>>('state')

    let value = refs[key]

    if (!value && options?.default !== undefined) {
        value = options.default()
    }

    if (value && options?.transform) {
        value = options.transform(value)
    }
    
    // Implementation here
    const state = ref<T>(value)

    const update = (newValue: any) => {
        refs[key] = newValue
        
        di.set('state', refs)
    }
    
    watch(state, update, { deep: true })

    // Logic to initialize and manage state
    return computed<T>({
        get: () => state.value,
        set: (newValue: T) => {
            state.value = newValue
            
            update(newValue)
        }
    })
}