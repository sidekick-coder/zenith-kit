<script setup lang="ts">
import Label from './ui/label/Label.vue'
import { Input } from '#client/components/ui/input'

defineProps({
    id: {
        type: String,
        default: '',
    },
    variant: {
        type: String,
        default: 'default',
    },
    type: {
        type: String,
        default: 'text',
    },
    label: {
        type: String,
        default: null,
    },
    hint: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: null,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    readonly: {
        type: Boolean,
        default: false,
    },
    autocomplete: {
        type: String,
        default: 'off',
    },
    autofocus: {
        type: Boolean,
        default: false,
    },
    lazy: {
        type: Boolean,
        default: false,
    },
    labelClass: {
        type: String,
        default: 'min-w-[132px]',
    },
    inputClass: {
        type: String,
        default: '',
    },
})

const [model, modifiers] = defineModel<string | number | null>({
    default: '',
})
</script>
<template>
    <div>
        <Label
            v-if="label && variant !== 'horizontal'"
            class="mb-4"
            :class="labelClass"
        >
            {{ label }}
        </Label>
        <div class="flex">
            <Label
                v-if="label && variant === 'horizontal'"
                class="h-10 flex items-center border px-2 rounded-l bg-secondary text-xs"
                :class="labelClass"
            >
                {{ label }}
            </Label>
            
            <slot name="prepend" />

            <Input
                :id
                :model-value="model"
                :type
                :placeholder
                :disabled
                :autocomplete
                :readonly
                :autofocus
                :class="[label && variant === 'horizontal' ? 'rounded-l-none flex-1' : '', inputClass]"
                class="h-10"
                @update:model-value="!modifiers.lazy && (model = $event)"
                @change="modifiers.lazy && (model = $event.target.value)"
            />

            <slot name="append" />
        </div>
        <p
            v-if="hint"
            class="text-sm text-muted-foreground"
        >
            {{ hint }}
        </p>
    </div>
</template>