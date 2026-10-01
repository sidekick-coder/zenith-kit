<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import type { HTMLAttributes } from 'vue'
import { useDashboardWidget } from '#client/composables/useDashboardWidget.ts'
import { tryCatch } from '#shared/index.ts'
import type WidgetTextDefinition from '#client/entities/WidgetTextDefinition.ts'
import Icon from '#client/components/Icon.vue'

const widget = useDashboardWidget()

const text = ref<string>()
const loading = ref(false)
const error = ref<any>()
const def = widget.value.definition as WidgetTextDefinition

const styles = computed(() => {
    const result = {
        color: '#ffffff',
        fontSize: '1rem',
        textAlign: 'center',
    }

    if (widget.value.options.color) {
        result.color = widget.value.options.color
    }

    if (widget.value.options.size) {
        result.fontSize = widget.value.options.size + 'rem'
    }

    if (widget.value.options.textAlign) {
        result.textAlign = widget.value.options.textAlign
    }

    return result as HTMLAttributes['style']
})

async function load() {
    loading.value = true

    const [err, data] = await tryCatch(() => def.text(widget.value.options))

    if (err) {
        loading.value = false
        error.value = err
        return
    }

    text.value = data

    await new Promise(resolve => setTimeout(resolve, 800)) // wait for chart to render 

    loading.value = false
}

onMounted(load)

watchDebounced(() => widget.value.options, load, {
    debounce: 500,
    deep: true
})
</script>
<template>
    <div v-if="loading" class="flex items-center justify-center h-full @container">
        <Icon name="Loader" class="animate-spin mr-2 @md:text-xl" />
    </div>

    <div v-else-if="error" class="flex flex-col items-center justify-center h-full">
        <div class="text-red-500 text-lg font-bold mb-2">
            {{ error?.error }}
        </div>
        <div class="text-red-500 text-xs">
            {{ error.message }}
        </div>
    </div>

    <div class="w-full h-full flex items-center justify-center" :style="styles">
        {{ text }}
    </div>
</template>
