<script setup lang="ts">
import { computed } from 'vue'
import { useColor } from '#client/composables/useColor'

const model = defineModel<string>({
    type: String,
    default: '#ff0000'
})

const { hsl } = useColor(model)

function parse(value: number, min: number, max: number): number {
    return Math.ceil(Math.min(max, Math.max(min, value)))
}

const hue = computed(() => hsl.value?.h || 0)
const saturation = computed(() => hsl.value?.s || 100)
const lightness = computed(() => hsl.value?.l || 50)

// Convert HSL to HSV for pointer position
const hsvSaturation = computed(() => {
    const s = saturation.value / 100
    const l = lightness.value / 100
    const v = l + s * Math.min(l, 1 - l)
    return v === 0 ? 0 : 2 * (1 - l / v) * 100
})

const hsvValue = computed(() => {
    const s = saturation.value / 100
    const l = lightness.value / 100
    return (l + s * Math.min(l, 1 - l)) * 100
})

function onClickWheel(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    
    // x = saturation, y = value (brightness in HSV)
    const sv = x
    const v = 1 - y
    
    // Convert HSV to HSL
    const l = v * (1 - sv / 2)
    const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l)
    
    hsl.value = {
        h: hsl.value?.h || 0,
        s: parse(sl * 100, 0, 100),
        l: parse(l * 100, 0, 100)
    }
}

function onClickSlider(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const h = ((e.clientX - rect.left) / rect.width) * 360

    hsl.value = {
        h: parse(h, 0, 360),
        s: hsl.value?.s || 100,
        l: hsl.value?.l || 50
    }
}
</script>

<template>
    <div class="space-y-4">
        <!-- Saturation/Lightness Picker -->
        <div class="relative w-full h-48 rounded-md overflow-hidden cursor-crosshair">
            <div
                class="absolute inset-0"
                :style="{
                    background: `linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`
                }"
            />
            <div
                class="absolute inset-0"
                style="background: linear-gradient(to bottom, transparent, #000)"
                @click="onClickWheel"
            >
                <div
                    class="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    :style="{
                        left: `${hsvSaturation}%`,
                        top: `${100 - hsvValue}%`
                    }"
                />
            </div>
        </div>

        <!-- Hue Slider -->
        <div class="space-y-2">
            <label class="text-sm font-medium mb-2 block">Hue</label>
            <div class="relative h-3 rounded-md overflow-hidden cursor-pointer">
                <div
                    class="absolute inset-0"
                    style="background: linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)"
                    @click="onClickSlider"
                >
                    <div
                        class="absolute w-1 h-full bg-white shadow-lg -translate-x-1/2 pointer-events-none"
                        :style="{ left: `${(hue / 360) * 100}%` }"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
