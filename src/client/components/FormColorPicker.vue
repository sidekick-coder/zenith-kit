<script setup lang="ts">
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '#client/components/ui/form'

import ColorPicker, { defaultPresets } from '#client/components/ColorPicker.vue'
import TextField from '#client/components/TextField.vue'

defineProps({
    name: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    hint: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: null,
    },
    readonly: {
        type: Boolean,
        default: true,
    },
    presets: {
        type: Array as () => string[],
        default: () => defaultPresets,
    },
})
</script>

<template>
    <FormField
        v-slot="{ componentField }"
        :name
        :validate-on-blur="false"
    >
        <ColorPicker
            :model-value="componentField.modelValue"
            :placeholder
            :readonly
            :presets
            @update:model-value="componentField['onUpdate:modelValue']"
        >
            <template #activator="{ color }">
                <FormItem>
                    <FormLabel>{{ label }}</FormLabel>
                    <FormControl>
                        <TextField
                            :model-value="color"
                            :placeholder
                            :readonly
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
                    </FormControl>
                    <FormDescription v-if="hint">
                        {{ hint }}
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            </template>
        </ColorPicker>
    </FormField>
</template>
