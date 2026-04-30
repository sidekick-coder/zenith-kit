<script setup lang="ts" generic="T = any">
import { Check, ChevronsUpDown } from 'lucide-vue-next'
import { useField } from 'vee-validate'
import { watchDebounced } from '@vueuse/core'
import { computed } from 'vue'
import type { PropType } from 'vue'
import { get } from 'lodash-es'
import Icon from './Icon.vue'
import Separator from './ui/separator/Separator.vue'
import { cn } from '#client/lib/utils'
import { Button } from '#client/components/ui/button'
import {
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '#client/components/ui/form'

import { Combobox, ComboboxAnchor, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxItemIndicator, ComboboxList } from '#client/components/ui/combobox'
import ComboboxTrigger from '#client/components/ui/combobox/ComboboxTrigger.vue'
import { Avatar } from '#client/components/ui/avatar'
import AvatarImage from '#client/components/ui/avatar/AvatarImage.vue'
import AvatarFallback from '#client/components/ui/avatar/AvatarFallback.vue'
import $fetch from '#client/facades/fetch.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

defineOptions({ inheritAttrs: false, })

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        default: null,
    },
    labelKey: {
        type: [String, Function] as PropType<string | ((option: any) => string)>,
        default: 'label',
    },
    subtitleKey: {
        type: [String, Function] as PropType<string | ((option: any) => string)>,
        default: null,
    },
    avatarKey: {
        type: [String, Function] as PropType<string | ((option: any) => string)>,
        default: null,
    },
    valueKey: {
        type: [String, Function] as PropType<string | ((option: any) => any)>,
        default: 'value',
    },
    hint: {
        type: String,
        default: null,
    },
    placeholder: {
        type: String,
        default: null,
    },
    clearable: {
        type: Boolean,
        default: false,
    },
    class: {
        type: String,
        default: null,
    },
    initialOption: {
        type: Object,
        default: null,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    fetch: {
        type: String,
        default: null,
    },
    fetchQuery: {
        type: Object as PropType<Record<string, any>>,
        default: () => ({}),
    },
    fetchOption: {
        type: [String, Function] as PropType<string | ((value: any) => Promise<any>)>,
        default: null,
    },
    serialize: {
        type: Function as PropType<(option: any) => T>,
        default: (option: any) => option as T,
    },
    listAttrs: {
        type: Object as PropType<Record<string, any>>,
        default: () => ({ portable: false, }),
    },
})

// general
const { setValue, value } = useField(props.name)
const selectedObject = defineModel<any>('selectedObject', {
    type: Object as PropType<T | null>,
    // default: () => props.initialOption,
})


const options = defineModel('options', {
    type: Array as () => T[],
    default: () => [],
})

const loading = defineModel('loading', {
    type: Boolean,
    default: false,
})

const search = defineModel('search', {
    type: String,
    default: '',
})

const formated = computed(() => {
    return options.value
        .map(o => props.serialize(o))
        .map(o => ({
            label: findLabel(o),
            subtitle: findSubtitle(o),
            avatar: findAvatar(o),
            value: findValue(o),
            initials: findAvatarInitial(o),
        }))
})

const selectedFormated = computed(() => {
    if (!selectedObject.value) {
        return null
    }

    const o = props.serialize(selectedObject.value)

    return {
        label: findLabel(o),
        subtitle: findSubtitle(o),
        avatar: findAvatar(o),
        value: findValue(o),
        initials: findAvatarInitial(o),
    }
})

function findValue(option: any) {
    if (!props.valueKey) {
        return option
    }

    if (typeof props.valueKey === 'function') {
        return props.valueKey(option)
    }

    return get(option, props.valueKey, option)
}

function findLabel(option: any) {
    if (!props.labelKey) {
        return null 
    }

    if (typeof props.labelKey === 'function') {
        return props.labelKey(option)
    }

    return get(option, props.labelKey, option)
}

function findSubtitle(option: any) {
    if (!props.subtitleKey) {
        return null 
    }

    if (typeof props.subtitleKey === 'function') {
        return props.subtitleKey(option)
    }

    return get(option, props.subtitleKey, null)
}

function findAvatar(option: any) {
    if (!props.avatarKey) {
        return null 
    }

    if (typeof props.avatarKey === 'function') {
        return props.avatarKey(option)
    }

    return get(option, props.avatarKey, null)
}

function findAvatarInitial(option: any) {
    const label = findLabel(option)
    
    if (label) {
        return String(label)
            .charAt(0)
            .toUpperCase()
    }

    return 'A'
}


function select(option: any) {
    if (!option) {
        selectedObject.value = null
        setValue(null)
        return
    }

    const item = options.value
        .map(o => props.serialize(o))
        .find((o: any) => findValue(o) === option.value)

    selectedObject.value = item

    setValue(item ? findValue(item) : null)
}

// fetch
async function loadSelected(){
    if (!props.fetchOption || !value.value) {
        return
    }

    loading.value = true

    const [error, response] = await tryCatch(() => {
        if (typeof props.fetchOption === 'string') {
            return $fetch.get(props.fetchOption.replace(':value', value.value as any), { method: 'GET', })
        }

        return props.fetchOption!(value.value)
    })

    if (error) {
        console.error('Failed to load selected option:', error)
        loading.value = false
        return
    }

    selectedObject.value = props.serialize(response)

    setTimeout(() => {
        loading.value = false
    }, 500)
}
async function load() {
    loading.value = true

    await loadSelected()

    const query = {
        ...props.fetchQuery,
        search: search.value,
    }

    const [error, response] = await $fetch.try<any>(props.fetch as string, {
        method: 'GET',
        query 
    })

    if (error) {
        console.error('Failed to load options:', error)
        options.value = []
        loading.value = false
        return
    }

    const items = response?.items || response

    options.value = items.map((i: any) => props.serialize(i))

    setTimeout(() => {
        loading.value = false
    }, 500)
}

if (props.fetch) {
    watchDebounced(search, load, {
        immediate: true,
        debounce: 1000,
    })
}


if (props.initialOption) {
    selectedObject.value = props.initialOption
}

if (!props.fetch && !props.initialOption && value.value) {
    const selected = formated.value.find((o: any) => o.value === value.value)

    if (selected) {
        select(selected)
    }
}

</script>

<template>
    <FormField :name="props.name">
        <FormItem class="flex flex-col">
            <FormLabel v-if="label">
                {{ label }}
            </FormLabel>
            
            <Combobox
                :ignore-filter="!!fetch"
                :disabled="disabled"
                :by="valueKey"
            >
                <ComboboxAnchor as-child>
                    <ComboboxTrigger as-child>
                        <Button
                            variant="outline"
                            class="justify-between w-full h-auto min-h-10"
                            :disabled="disabled"
                        >
                            <div
                                v-if="selectedFormated"
                                class="flex items-center gap-2 text-left"
                            >
                                <div
                                    v-if="avatarKey"
                                    class="flex-shrink-0"
                                >
                                    <slot
                                        name="avatar"
                                        :option="selectedFormated"
                                    >
                                        <Avatar class="size-6">
                                            <AvatarImage
                                                v-if="selectedFormated.avatar"
                                                :src="selectedFormated.avatar"
                                                :alt="selectedFormated.label"
                                            />
                                            <AvatarFallback>
                                                {{ selectedFormated.initials }}
                                            </AvatarFallback>
                                        </Avatar>
                                    </slot>
                                </div>
                                <div class="flex flex-col items-start flex-1">
                                    <slot
                                        name="label"
                                        :option="selectedFormated"
                                    >
                                        {{ selectedFormated.label }}
                                    </slot>
                                    <div
                                        v-if="subtitleKey"
                                        class="text-sm text-muted-foreground white-space-normal break-words truncate max-w-sm"
                                    >
                                        <slot
                                            name="subtitle"
                                            :option="selectedObject"
                                        >
                                            {{ selectedFormated.subtitle || '-' }}
                                        </slot>
                                    </div>
                                </div>
                            </div>

                            <div v-else>
                                {{ placeholder }}
                            </div>

                            <div class="ml-2 flex items-center space-x-2">
                                <Icon
                                    v-if="loading"
                                    name="Loader2"
                                    class="animate-spin"
                                />

                                <ChevronsUpDown class="size-4 shrink-0 opacity-50" />
                            </div>
                        </Button>
                    </ComboboxTrigger>
                </ComboboxAnchor>

                <ComboboxList
                    align="start"
                    class="w-md"
                    v-bind="listAttrs"
                >
                    <div class="relative w-full items-center">
                        <ComboboxInput
                            v-model="search"
                            :disabled="disabled"
                        />
                    </div>

                    <ComboboxEmpty class="px-6">
                        {{ $t('No results') }}
                    </ComboboxEmpty>

                    <ComboboxGroup class="max-h-60 overflow-y-auto">
                        <template v-if="clearable">
                            <ComboboxItem
                                :value="null"
                                @click="select(null)"
                            >
                                {{ $t('Clear selection') }}
                            </ComboboxItem>
                            
                            <Separator />
                        </template>

                        <ComboboxItem
                            v-for="o in formated"
                            :key="o.value"
                            :value="o.value"
                            @click="select(o)"
                        >
                            <div
                                v-if="avatarKey"
                                class="flex-shrink-0 mr-2"
                            >
                                <slot
                                    name="avatar"
                                    :option="o"
                                >
                                    <Avatar class="size-6">
                                        <AvatarImage
                                            v-if="o.avatar"
                                            :src="o.avatar"
                                            :alt="o.label"
                                        />
                                        <AvatarFallback>
                                            {{ o.initials }}
                                        </AvatarFallback>
                                    </Avatar>
                                </slot>
                            </div>
                            <div class="flex flex-col items-start flex-1">
                                <slot
                                    name="label"
                                    :option="o"
                                >
                                    {{ o.label }}
                                </slot>
                                <div
                                    v-if="subtitleKey"
                                    class="text-sm text-muted-foreground"
                                >
                                    <slot
                                        name="subtitle"
                                        :option="o"
                                    >
                                        {{ o.subtitle || '-' }}
                                    </slot>
                                </div>
                            </div>

                            <ComboboxItemIndicator>
                                <Check :class="cn('ml-auto h-4 w-4')" />
                            </ComboboxItemIndicator>
                        </ComboboxItem>
                    </ComboboxGroup>
                </ComboboxList>
            </Combobox>

            <FormDescription v-if="hint">
                {{ hint }}
            </FormDescription>
            <FormMessage />
        </FormItem>
    </FormField>
</template>
