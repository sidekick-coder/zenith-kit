<script lang="ts" setup>
import DatePicker from './DatePicker.vue'
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '#client/components/ui/form'

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
        default: null
    },
    disabled: {
        type: Boolean,
        default: null
    },
    readonly: {
        type: Boolean,
        default: null
    },
})
</script>

<template>
    <FormField
        v-slot="{ componentField }"
        :name
        :disabled
        :readonly
    >
        <FormItem>
            <FormLabel>{{ label }}</FormLabel>
            <FormControl>
                <DatePicker
                    v-bind="$attrs"
                    :model-value="componentField.modelValue"
                    :disabled
                    @blur="componentField.onBlur"
                    @update:model-value="componentField['onUpdate:modelValue']"
                />
            </FormControl>
            <FormDescription v-if="hint">
                {{ hint }}
            </FormDescription>
            <FormMessage />
        </FormItem>
    </FormField>
</template>
