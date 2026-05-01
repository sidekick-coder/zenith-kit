<script setup lang="ts">
import Switch from '#client/components/ui/switch/Switch.vue'

defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    label: {
        type: String,
        required: true,
    },
    hint: {
        type: String,
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
})

defineEmits(['update:modelValue'])
</script>

<template>
    <div class="rounded-lg border p-4 flex items-center justify-between gap-x-4">
        <div class="space-y-2">
            <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {{ label }}
            </label>
            <p
                v-if="hint"
                class="text-sm text-muted-foreground"
            >
                {{ hint }}
            </p>
        </div>
        <Switch
            :disabled
            :model-value="modelValue"
            @update:model-value="$emit('update:modelValue', $event)"
        />
    </div>
</template>