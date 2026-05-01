<script setup lang="ts">
import { FormField } from './ui/form'
import FormDescription from './ui/form/FormDescription.vue'
import FormItem from './ui/form/FormItem.vue'
import FormLabel from './ui/form/FormLabel.vue'
import FormMessage from './ui/form/FormMessage.vue'
import Select from './ZSelect.vue'

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
    readonly: {
        type: Boolean,
        default: false,
    },
})

const options = defineModel('options', {
    type: Array,
    default: () => [],
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
            <Select
                v-model:options="options"
                :model-value="componentField.modelValue"
                v-bind="$attrs"
                @blur="componentField.onBlur"
                @update:model-value="componentField['onUpdate:modelValue']"
            />
            <FormDescription v-if="hint">
                {{ hint }}
            </FormDescription>
            <FormMessage />
        </FormItem>
    </FormField>
</template>
