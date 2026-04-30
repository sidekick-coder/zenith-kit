<script setup lang="ts">
import Icon from './Icon.vue'
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '#client/components/ui/form'

import { Input } from '#client/components/ui/input'
import { Button } from '#client/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '#client/components/ui/dropdown-menu'

defineProps({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        default: 'text',
    },
    step: {
        type: [String, Number],
        default: null,
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
    disabled: {
        type: Boolean,
        default: false,
    },
    readonly: {
        type: Boolean,
        default: false,
    },
    autocomplete: {
        type: String,
        default: 'off',
    },
    autofocus: {
        type: Boolean,
        default: false,
    },
    presets: {
        type: Array as () => Array<{ label: string; value: string }>,
        default: () => [],
    },
})
</script>
<template>
    <FormField
        v-slot="{ componentField }"
        :name
        :validate-on-blur="false"
    >
        <FormItem>
            <FormLabel>{{ label }}</FormLabel>
            <FormControl>
                <div class="flex gap-2">
                    <Input
                        :type
                        :placeholder
                        :disabled
                        :autocomplete
                        :readonly
                        :autofocus
                        :step
                        class="h-10 flex-1"
                        v-bind="componentField"
                    />
                    
                    <DropdownMenu v-if="presets.length > 0">
                        <DropdownMenuTrigger as-child>
                            <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                class="h-10"
                            >
                                <Icon
                                    name="chevron-down"
                                    class="w-4 h-4"
                                />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                v-for="preset in presets"
                                :key="preset.value"
                                @click="componentField.onChange(preset.value)"
                            >
                                {{ preset.label }}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <slot name="append" />
                </div>
            </FormControl>
            <FormDescription v-if="hint">
                {{ hint }}
            </FormDescription>
            <FormMessage />
        </FormItem>
    </FormField>
</template>