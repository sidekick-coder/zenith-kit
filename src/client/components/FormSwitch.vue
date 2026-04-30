<script setup lang="ts">
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '#client/components/ui/form'
import Switch from '#client/components/ui/switch/Switch.vue'

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
})
</script>

<template>
    <FormField
        v-slot="{ value, handleChange }"
        :name
        :validate-on-blur="false"
    >
        <FormItem class="rounded-lg border p-4 flex items-center justify-between gap-x-4">
            <div class="space-y-2">
                <FormLabel>{{ label }}</FormLabel>
                <FormDescription v-if="hint">
                    {{ hint }}
                </FormDescription>
                <FormMessage />
            </div>
            <FormControl>
                <Switch
                    :disabled
                    :model-value="value"
                    @update:model-value="handleChange"
                />
            </FormControl>
        </FormItem>
    </FormField>
</template>
