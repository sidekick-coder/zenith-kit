<script setup lang="ts">
import Textarea from '#client/components/ui/textarea/Textarea.vue'

defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    label: {
        type: String,
        default: '',
    },
    hint: {
        type: String,
        default: '',
    },
    rows: {
        type: Number,
        default: 3,
    },
    textareaClass: {
        type: String,
        default: '',
    }
})

defineEmits(['update:modelValue'])
</script>
<template>
    <div>
        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {{ label }}
        </label>
        <Textarea
            :model-value="modelValue"
            class="min-h-20"
            :rows="rows"
            :class="textareaClass"
            @update:model-value="$emit('update:modelValue', $event)"
        />
        <p
            v-if="hint"
            class="text-sm text-muted-foreground"
        >
            {{ hint }}
        </p>
    </div>
</template>