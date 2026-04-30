<script lang="ts">
export const defaultPresets = [
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#10b981',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
    '#64748b',
    '#000000',
    '#ffffff'
]
</script>
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '#client/components/ui/popover'
import { Input } from '#client/components/ui/input'
import TextField from '#client/components/TextField.vue'
import ColorWheel from '#client/components/ColorWheel.vue'
import { useColor, useColorType } from '#client/composables/useColor'

const props = defineProps({
    class: {
        type: String,
        default: null
    },
    label: {
        type: String,
        default: null
    },
    variant: {
        type: String,
        default: null
    },
    placeholder: {
        type: String,
        default: null
    },
    readonly: {
        type: Boolean,
        default: true
    },
    presets: {
        type: Array as () => string[],
        default: () => defaultPresets
    }
})

const open = ref(false)
const color = defineModel({ type: String, })

const format = useColorType(color)
const { hex, rgb, rgba, hsl, oklch } = useColor(color)

const colorInput = computed({
    get() {
        if (format.value === 'hex') {
            return hex.value
        }

        if (format.value === 'rgba' && rgba.value) {
            return `rgba(${rgba.value.r}, ${rgba.value.g}, ${rgba.value.b}, ${rgba.value.a})`
        }

        if (format.value === 'rgb' && rgb.value) {
            return `rgb(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b})`
        }

        if (format.value === 'hsl' && hsl.value) {
            return `hsl(${hsl.value.h}, ${hsl.value.s}%, ${hsl.value.l}%)`
        }

        if (format.value === 'oklch' && oklch.value) {
            return `oklch(${oklch.value.l} ${oklch.value.c} ${oklch.value.h})`
        }

        return ''
    },
    set(value: string | null) {
        if (!value) {
            return
        }

        color.value = value
    }
})

watch(format, (newFormat) => {
    console.log('Format changed to:', newFormat)
    if (newFormat === 'hex') {
        colorInput.value = hex.value
        return
    }

    if (newFormat === 'rgb' && rgb.value) {
        colorInput.value = `rgb(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b})`
        return
    }

    if (newFormat === 'rgba' && rgba.value) {
        colorInput.value = `rgba(${rgba.value.r}, ${rgba.value.g}, ${rgba.value.b}, ${rgba.value.a})`
        return
    }

    if (newFormat === 'hsl' && hsl.value) {
        colorInput.value = `hsl(${hsl.value.h}, ${hsl.value.s}%, ${hsl.value.l}%)`
        return
    }

    if (newFormat === 'oklch' && oklch.value) {
        colorInput.value = `oklch(${oklch.value.l} ${oklch.value.c} ${oklch.value.h})`
        return
    }
})

function updateRgbaAlpha(val: string | number) {
    if (!rgba.value) return
    const a = Math.max(0, Math.min(1, Number(val)))
    color.value = `rgba(${rgba.value.r}, ${rgba.value.g}, ${rgba.value.b}, ${a})`
}

</script>

<template>
    <Popover v-model:open="open">
        <PopoverTrigger as-child>
            <slot
                name="activator"
                :color="color"
                :open="open"
            >
                <TextField
                    v-model="color"
                    :label="label"
                    :variant="variant"
                    :placeholder="placeholder"
                    :readonly="readonly"
                    :class="props.class"
                    class="cursor-pointer"
                    input-class="text-left rounded-l-none"
                >
                    <template #prepend>
                        <div
                            class="size-10 border rounded-l shrink-0"
                            :style="{ backgroundColor: color }"
                        />
                    </template>
                </TextField>
            </slot>
        </PopoverTrigger>

        <PopoverContent
            class="w-72 p-4"
            align="start"
        >
            <div class="space-y-4">
                <ColorWheel v-model="color" />

                <!-- Color Format Input -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <button
                            v-for="fmt in ['hex', 'rgb', 'rgba', 'hsl', 'oklch']"
                            :key="fmt"
                            type="button"
                            class="text-xs px-2 py-1 rounded  font-medium uppercase"
                            :class="format === fmt ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'"
                            @click="format = fmt"
                        >
                            {{ fmt }}
                        </button>
                    </div>
                    <Input
                        :model-value="colorInput"
                        :class="{ 'uppercase': format === 'hex' }"
                        class="font-mono"
                        :placeholder="format === 'hex' ? '#000000' : format === 'rgb' ? 'rgb(0, 0, 0)' : format === 'rgba' ? 'rgba(0, 0, 0, 1)' : format === 'hsl' ? 'hsl(0, 0%, 0%)' : 'oklch(0 0 0)'"
                        @change="(e: any) => {
                            colorInput = e.target.value
                        }"
                    />
                    <!-- Opacity field for RGBA -->
                    <div
                        v-if="format === 'rgba' && rgba && rgba"
                        class="flex items-center gap-2 mt-2"
                    >
                        <label class="text-xs">{{ $t('Opacity') }}</label>
                        <Input
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            :model-value="rgba.a"
                            class="w-16 font-mono"
                            @change="(e: any) => updateRgbaAlpha(e.target.value)"
                        />
                    </div>
                </div>

                <!-- Preset Colors -->
                <div class="space-y-2">
                    <label class="text-sm font-medium mb-2 block">Presets</label>
                    <div class="grid grid-cols-10 gap-2">
                        <button
                            v-for="preset in presets"
                            :key="preset"
                            type="button"
                            class="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                            :style="{ backgroundColor: preset }"
                            @click="() => {
                                color = preset
                            }"
                        />
                    </div>
                </div>
            </div>
        </PopoverContent>
    </Popover>
</template>
