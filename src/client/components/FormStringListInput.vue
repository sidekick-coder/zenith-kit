<script setup lang="ts">
import StringListInput from './StringListInput.vue'
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
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    placeholder: {
        type: String,
        default: null,
    },
})
</script>

<template>
    <FormField
        v-slot="{ value, setValue }"
        :name
        :validate-on-blur="false"
    >
        <FormItem>
            <FormLabel>{{ label }}</FormLabel>
            <FormControl>
                <StringListInput
                    :disabled
                    :name
                    :placeholder
                    :model-value="value"
                    @update:model-value="setValue"
                />
            </FormControl>
            <FormDescription v-if="hint">
                {{ hint }}
            </FormDescription>
            <FormMessage />
        </FormItem>
    </FormField>
</template>