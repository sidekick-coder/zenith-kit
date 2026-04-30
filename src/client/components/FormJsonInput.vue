<script setup lang="ts">
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '#client/components/ui/form'
import JsonInput from '#client/components/JsonInput.vue'

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
        default: null,
    },
    mode: {
        type: String as () => 'text' | 'object',
        required: true
    },
})
</script>
<template>
    <FormField
        v-slot="{ value, setValue }"
        :name
    >
        <FormItem>
            <FormLabel>{{ label }}</FormLabel>
            <FormControl>
                <JsonInput
                    :mode="mode"
                    :model-value="value"
                    v-bind="$attrs"
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
