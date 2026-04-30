<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import Icon from './Icon.vue'
import { Input } from '#client/components/ui/input'
import { Button } from '#client/components/ui/button'
import { cn } from '#client/lib/utils'


defineOptions({
    inheritAttrs: false,
})

const model = defineModel({
    type: Array as () => string[],
    default: () => [],
})

defineProps({
    name: {
        type: String,
        required: true,
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

const inputValue = ref('')

function add() {
    const v = inputValue.value.trim()
    
    if (!v) return
    
    model.value = [...model.value, v]

    inputValue.value = ''
}

function remove(index: number) {
    model.value = model.value.filter((_, i) => i !== index)
}
</script>

<template>
    <div class="space-y-2">
        <!-- Input + Add button -->
        <div class="flex gap-2">
            <Input
                v-model="inputValue"
                :placeholder="placeholder"
                class="flex-1 h-10"
                :disabled
                @keydown.enter.prevent="add"
            />
            <Button 
                :disabled
                type="button"
                class="h-10"
                @click="add"
            >
                <Icon
                    name="plus"
                    class="w-4 h-4"
                />
            </Button>
        </div>

        <!-- List -->
        <div class="space-y-1">
            <div
                v-for="(item, i) in model"
                :key="i"
                class="flex items-center justify-between rounded border p-2 bg-muted"
            >
                <div class="text-sm truncate">
                    {{ item }}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    :disabled
                    @click="remove(i)"
                >
                    <X class="w-4 h-4" />
                </Button>
            </div>
        </div>
    </div>
</template>
