<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Textarea from '#client/components/ui/textarea/Textarea.vue'

const model = defineModel<string | object>()

const props = defineProps({
    mode: {
        type: String as () => 'text' | 'object',
        required: true,
    },
    label: {
        type: String,
        default: null
    },
    hint: {
        type: String,
        default: null
    },
    rows: {
        type: Number,
        default: null
    },
    textareaClass: {
        type: String,
        default: null
    }
})

const emit = defineEmits<{
    (e: 'blur'): void
}>()

const textValue = computed({
    get() {
        if (props.mode === 'object' && typeof model.value === 'object') {
            return JSON.stringify(model.value, null, 2)
        }
        
        return model.value as string || ''
    },
    set(value: string) {
        if (props.mode === 'object') {
            try {
                const parsed = JSON.parse(value)
                model.value = parsed
            } catch {
                model.value = value
            }
            return
        }
        model.value = value
    }
})

function format(){
    if (props.mode === 'object' && typeof model.value === 'object') {
        textValue.value = JSON.stringify(model.value, null, 2)
        return
    }

    textValue.value = JSON.stringify(JSON.parse(textValue.value), null, 2)
}

function onBlur() {
    format()

    emit('blur')
}

onMounted(format)

</script>
<template>
    <div>
        <label
            v-if="label"
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block"
        >
            {{ label }}
        </label>
        <Textarea
            v-model="textValue"
            class="min-h-20 font-mono"
            :rows="rows || (mode === 'object' ? 6 : 3)"
            :class="textareaClass"
            @blur="onBlur"
        />
        <p
            v-if="hint"
            class="text-sm text-muted-foreground mt-2"
        >
            {{ hint }}
        </p>
    </div>
</template>
