<script lang="ts" setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { fromDate,  getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import Icon from './Icon.vue'
import { Calendar } from '#client/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '#client/components/ui/popover'
import { Button } from '#client/components/ui/button'
import { Input } from '#client/components/ui/input'
import { cn } from '#client/lib/utils'

const props = defineProps({
    placeholder: {
        type: String,
        default: undefined
    },
    disabled: {
        type: Boolean,
        default: undefined
    },
    class: {
        type: String,
        default: undefined
    },
    mode: {
        type: String as () => 'date' | 'datetime',
        default: 'date'
    },
    clearable: {
        type: Boolean,
        required: false
    }
})

const model = defineModel<any>({
    type: [Date, String],
    default: null
})

const open = ref(false)
const hours = ref('00')
const minutes = ref('00')

const displayValue = computed(() => {
    if (!model.value) {
        return props.placeholder || $t('Select date')
    }
    
    if (props.mode === 'datetime') {
        return format(model.value, 'yyyy-MM-dd HH:mm')
    }
    
    return format(model.value, 'yyyy-MM-dd')
})

function updateDateTime() {
    if (!model.value) {
        return
    }

    const date = new Date(model.value)
    date.setHours(parseInt(hours.value) || 0)
    date.setMinutes(parseInt(minutes.value) || 0)
    date.setSeconds(0)
    date.setMilliseconds(0)
    
    model.value = date
}

function clearDate(event: Event) {
    event.stopPropagation()
    model.value = null
    hours.value = '00'
    minutes.value = '00'
}

const calendarValue = computed({
    get() {
        if (!model.value) {
            return undefined
        }

        const date = new Date(model.value)

        return fromDate(date, getLocalTimeZone())
    },
    set(value: DateValue | undefined) {
        if (!value) {
            model.value = null
            open.value = false
            return
        }
    
        const date = new Date(value.year, value.month - 1, value.day)
        
        if (props.mode === 'datetime') {
            date.setHours(parseInt(hours.value) || 0)
            date.setMinutes(parseInt(minutes.value) || 0)
            date.setSeconds(0)
            date.setMilliseconds(0)
            
            hours.value = date.getHours()
                .toString()
                .padStart(2, '0')

            minutes.value = date.getMinutes().toString()
                .padStart(2, '0')
            
        }
    
        model.value = date

        if (props.mode === 'date') {
            open.value = false
        }
    }
})
</script>

<template>
    <Popover v-model:open="open">
        <PopoverTrigger as-child>
            <Button
                variant="outline"
                :class="cn(
                    'w-full justify-start text-left font-normal !h-10',
                    !model && 'text-muted-foreground',
                    props.class
                )"
                :disabled="disabled"
            >
                <Icon
                    name="calendar"
                    class="mr-2 h-4 w-4"
                />
                {{ displayValue }}
                <Icon
                    v-if="clearable && model"
                    name="x"
                    class="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
                    @click="clearDate"
                />
            </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0">
            <Calendar v-model="calendarValue" />
            <div
                v-if="mode === 'datetime'"
                class="p-3 border-t"
            >
                <div class="flex items-center gap-2">
                    <div class="flex-1">
                        <label class="text-sm font-medium">{{ $t('Hours') }}</label>
                        <Input
                            v-model="hours"
                            type="number"
                            min="0"
                            max="23"
                            class="mt-1"
                            @input="updateDateTime"
                        />
                    </div>
                    <div class="flex-1">
                        <label class="text-sm font-medium">{{ $t('Minutes') }}</label>
                        <Input
                            v-model="minutes"
                            type="number"
                            min="0"
                            max="59"
                            class="mt-1"
                            @input="updateDateTime"
                        />
                    </div>
                </div>
                <Button
                    variant="default"
                    size="sm"
                    class="w-full mt-3"
                    @click="open = false"
                >
                    {{ $t('Done') }}
                </Button>
            </div>
        </PopoverContent>
    </Popover>
</template>
