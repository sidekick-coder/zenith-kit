<script setup lang="ts">
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '#client/components/ui/form'
import Textarea from '#client/components/ui/textarea/Textarea.vue'

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
    rows: {
        type: Number,
        default: 3,
    },
})
</script>
<template>
    <FormField
        v-slot="{ componentField }"
        :name
    >
        <FormItem>
            <FormLabel>{{ label }}</FormLabel>
            <FormControl>
                <Textarea
                    class="min-h-20"
                    :rows="rows"
                    v-bind="{...$attrs, ...componentField}"
                />
            </FormControl>
            <FormDescription v-if="hint">
                {{ hint }}
            </FormDescription>
            <FormMessage />
        </FormItem>
    </FormField>
</template>