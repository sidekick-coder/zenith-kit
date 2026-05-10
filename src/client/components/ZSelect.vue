<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { get } from 'lodash-es'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from './ui/select'
import Label from './ui/label/Label.vue'
import Button from './ZButton.vue'
import { Input } from '#client/components/ui/input/index.ts'
import $fetch from '#client/facades/fetcher.ts'
import { cn } from '#client/lib/utils.ts'
import logger from '#client/facades/logger.ts'

const props = defineProps({
    id: {
        type: String,
        default: '',
    },
    variant: {
        type: String,
        default: 'default',
    },
    label: {
        type: String,
        default: '',
    },
    placeholder: {
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
    labelKey: {
        type: String,
        default: 'label',
    },
    descriptionKey: {
        type: String,
        default: null,
    },
    valueKey: {
        type: String,
        default: 'value',
    },
    fetch: {
        type: String,
        default: '',
    },
    fetchOptions: {
        type: Object,
        default: () => ({}),
    },
    fetchKey: {
        type: String,
        default: 'items',
    },
    labelClass: {
        type: String,
        default: '',
    },
    clearable: {
        type: Boolean,
        default: false,
    },
    multiple: {
        type: Boolean,
        default: false,
    },
    badge: {
        type: Boolean,
        default: false,
    },
    colorKey: {
        type: String,
        default: 'color',
    },
    showSearchInput: {
        type: Boolean,
        default: false,
    },
})

const model = defineModel<any>({ 
    required: true,
    default: null
})

const search = ref('')

const formated = computed(() => options.value.map(option => ({
    label: findLabel(option),
    value: findValue(option),
    description: findDescription(option),
    color: findColor(option),
})))

const visibleOptions = computed(() => {
    const term = search.value.trim().toLowerCase()

    if (!term) {
        return formated.value
    }

    return formated.value.filter(option => {
        const label = String(option.label || '').toLowerCase()
        const description = String(option.description || '').toLowerCase()

        return label.includes(term) || description.includes(term)
    })
})

const options = defineModel('options', {
    type: Array,
    default: () => [],
})

const selected = computed(() => {
    if (props.multiple) {
        return formated.value.filter(option => model.value?.includes(option.value))
    }

    return formated.value.find(option => option.value === model.value) || null
})

function findLabel(option: any) {
    return get(option, props.labelKey) || option
}

function findValue(option: any) {
    return get(option, props.valueKey) || option
}

function findDescription(option: any) {
    if (!props.descriptionKey) {
        return null
    }
    return get(option, props.descriptionKey)
}

function findColor(option: any) {
    if (!props.colorKey) {
        return null
    }
    return get(option, props.colorKey)
}

function findFetchOptions(response: any) {
    if (!props.fetchKey) {
        return response
    }
    return get(response, props.fetchKey)
}

async function doFetchOptions() {
    if (!props.fetch) return

    const [error, response] = await $fetch.try(props.fetch, props.fetchOptions)

    if (error) {
        logger.error('Select fetch error:', error)
        return
    }

    options.value = findFetchOptions(response)
}

function all() {
    model.value = visibleOptions.value.map(option => option.value)
}

function clear(){
    model.value = []
}

onMounted(() => {
    if (!options.value.length && props.fetch) {
        doFetchOptions()
    }
})

watch(() => props.showSearchInput, (showSearchInput) => {
    if (!showSearchInput) {
        search.value = ''
    }
})
</script>

<template>
    <div>
        <Label
            v-if="label && variant !== 'horizontal'"
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-4"
            :class="labelClass"
        >
            {{ label }}
        </Label>

        <div class="flex">
            <Label
                v-if="variant === 'horizontal'"
                class="h-10 flex items-center border px-2 rounded-l bg-secondary text-xs"
                :class="labelClass"
            >
                {{ label }}
            </Label>
            <Select
                :id
                v-model="model"
                :disabled="disabled"
                :multiple="multiple"
                >
                <SelectTrigger
                    :class="cn('!h-10', variant === 'horizontal' ? 'rounded-l-none flex-1' : 'w-full', $attrs.class as any)"
                >
                    <div 
                        v-if="multiple && model?.length > 2"
                        class="flex items-center gap-2"
                    >
                        <span class="text-sm">{{ model.length }} selected</span>
                    </div>

                    <div
                        v-else-if="selected && !Array.isArray(selected)"
                        class="flex flex-col"
                    >
                        <span>{{ selected.label }}</span>
                    </div>

                    <SelectValue
                        v-else
                        :placeholder="placeholder"
                    />
                </SelectTrigger>
                <SelectContent class="max-h-92">
                    <template
                        v-if="showSearchInput"
                        #top
                    >
                        <div class="border-b p-2">
                            <Input
                                v-model="search"
                                :placeholder="$t('Search')"
                                class="h-9"
                                @keydown.enter.stop
                                @keydown.stop
                                @click.stop
                            />
                        </div>
                    </template>
                    <SelectGroup>
                        <SelectLabel v-if="!visibleOptions.length">
                            {{ $t('No items') }}
                        </SelectLabel>
                        <select-item
                            v-if="clearable && !multiple"
                            :value="null"
                            @click="model = multiple ? [] : null"
                        >
                            {{ $t('None') }}
                        </select-item>
                        <select-item
                            v-for="o in visibleOptions"
                            :key="o.value"
                            :value="o.value"
                        >
                            <div
                                v-if="badge"
                                class="px-2 py-1 rounded-md text-xs font-medium"
                                :style="{ backgroundColor: o.color || '#3b82f6', color: 'white' }"
                            >
                                {{ o.label }}
                            </div>
                            <div
                                v-if="!badge"
                                class="flex flex-col"
                            >
                                <span>{{ o.label }}</span>
                                <span
                                    v-if="descriptionKey"
                                    class="text-xs text-muted-foreground white-space-normal break-words mt-0.5"
                                >
                                    {{ o.description }}
                                </span>
                            </div>
                        </select-item>
                    </SelectGroup>

                    <template
                        v-if="multiple"
                        #bottom
                    >
                        <div class="flex space-x-2 p-2 border-t justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                :disabled="options.length === model?.length"
                                @click="all"
                            >
                                {{ $t('All') }}
                            </Button>
                            <Button
                                v-if="clearable"
                                variant="outline"
                                size="sm"
                                :disabled="model?.length === 0"
                                @click="clear"
                            >
                                {{ $t('Clear') }}
                            </Button>
                        </div>
                    </template>
                </SelectContent>
            </Select>
        </div>
    </div>
</template>
