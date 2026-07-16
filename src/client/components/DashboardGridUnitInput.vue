<script lang="ts" setup>
import { ref } from 'vue'
import type { DashboardGridUnit } from '#client/entities/DashboardWidgetData.ts'
import Icon from '#client/components/Icon.vue'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuGroup,
} from '#client/components/ui/dropdown-menu'

const props = defineProps({
    label: {
        type: String,
        required: false,
        default: 'Grid Unit'
    },
    filled: {
        type: Boolean,
        default: false
    },
    custom: {
        type: Boolean,
        default: false
    },
    options: {
        type: Array as () => {
            label: string
            value: number
        }[],
        required: false,
        default: () => ([])
    }
})

const model = defineModel<DashboardGridUnit>({
    type: Object,
    default: () => ({}) 
})

const breakpoints = ['base', 'sm', 'md', 'lg', 'xl'] as const
const selectedBreakpoint = ref<string>('base')

function update(bp: string, value: number | undefined = undefined) {
    model.value = {
        ...model.value,
        [bp]:  value
    }
}

function getButtonClasses(bp: keyof DashboardGridUnit, v: number) {
    const classes = [
        'size-8 rounded-sm border text-xs transition-colors',
    ]

    let active = false
    const currentValue = model.value[bp] || 0

    if (props.filled && v <= currentValue) {
        active = true
    } 

    if (!props.filled && v == currentValue) {
        active = true
    }

    classes.push(
        active
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-muted hover:bg-muted-foreground/20'
    )

    return classes
}
</script>
<template>
    <div class="py-2">
        <div class="flex mb-4">
            <p class="flex-1 text-xs font-medium uppercase text-muted-foreground">
                {{ label }}
            </p>
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <button
                        type="button"
                        class="flex items-center gap-1 rounded-sm border px-2 py-1 text-xs font-medium transition-colors hover:bg-muted"
                    >
                        {{ selectedBreakpoint }}
                        <Icon
                            name="ChevronDown"
                            class="size-3"
                        />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            v-for="bp in breakpoints"
                            :key="bp"
                            @click="selectedBreakpoint = bp"
                        >
                            {{ bp }}
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div
            v-for="bp in breakpoints"
            :key="bp"
            :class="[
                selectedBreakpoint === bp ? 'block' : 'hidden'
            ]"
        >
            <div class="flex gap-1">
                <button
                    :disabled="bp === 'base'"
                    type="button"
                    :class="[
                        'h-8 w-8 shrink-0 rounded-sm border text-xs transition-colors',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        !model[bp]
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-muted hover:bg-muted-foreground/20',
                    ]"
                    @click="update(bp)"
                >
                    <Icon
                        name="X"
                        class="mx-auto size-3"
                    />
                </button>
                <button
                    v-for="o in options"
                    :key="o.value"
                    type="button"
                    :class="getButtonClasses(bp, o.value)"
                    @click="update(bp, o.value)"
                >
                    {{ o.label }}
                </button>
                <input
                    v-if="custom"
                    :value="model[bp]"
                    type="number"
                    class="size-8 rounded-sm border border-border bg-muted px-2 text-xs outline-none focus:border-primary [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    @input="(e) => update(bp, Number((e.target as HTMLInputElement).value))"
                >
            </div>
        </div>
    </div>
</template>
