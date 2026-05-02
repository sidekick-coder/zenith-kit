<script setup lang="ts">
import { computed, resolveComponent } from 'vue'
import Icon from './Icon.vue'
import { Tooltip, TooltipContent, TooltipTrigger } from '#client/components/ui/tooltip/index.ts'
import UiButton from '#client/components/ui/button/Button.vue'
const RouterLink = resolveComponent('RouterLink')
const props = defineProps({
    label: {
        type: String,
        default: null,
    },
    type: {
        type: String as () => 'button' | 'submit' | 'reset',
        default: 'button',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    href: {
        type: String,
        default: null,
    },
    to: {
        type: String,
        default: null,
    },
    tooltip: {
        type: String,
        default: null,
    },
    tooltipSide: {
        type: String as () => 'top' | 'right' | 'bottom' | 'left',
        default: 'top',
    },
})

defineOptions({ inheritAttrs: false, })

const loading = defineModel<boolean>('loading', {
    type: Boolean,
    default: false,
})

const emit = defineEmits<{
    (e: 'click', event: Event): void
}>()

function onClick(e: Event) {
    if (props.href) {
        return
    }

    emit('click', e)
}

const as = computed(() => {
    if (props.to) return RouterLink
    if (props.href) return 'a'
    return 'button'
})
</script>

<template>

    <Tooltip v-if="tooltip">
        <TooltipTrigger as-child>
            <UiButton v-bind="$attrs" :disabled="disabled || loading" :as :href="to ? to : href" :to :type
                @click="onClick">
                <Icon v-if="loading" name="Loader2" class="animate-spin" />

                <span v-else-if="label" class="text-sm">
                    {{ label }}
                </span>

                <slot v-else />
            </UiButton>
        </TooltipTrigger>
        <TooltipContent :side="tooltipSide">
            {{ tooltip }}
        </TooltipContent>
    </Tooltip>
    <UiButton v-else v-bind="$attrs" :disabled="disabled || loading" :as :href="to ? to : href" :to :type
        @click="onClick">
        <Icon v-if="loading" name="Loader2" class="animate-spin" />

        <span v-else-if="label" class="text-sm">
            {{ label }}
        </span>

        <slot v-else />
    </UiButton>
</template>
