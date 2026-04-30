<script lang="ts">
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import Icon from './Icon.vue'
import { Tooltip, TooltipContent, TooltipTrigger } from '#client/components/ui/tooltip'
import UiButton from '#client/components/ui/button/Button.vue'

export interface Props {
    label?: string | null;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    href?: string | null;
    to?: string | null;
    tooltip?: string | null;
    tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
}
</script>
<script setup lang="ts">
const props = withDefaults(
    defineProps<Props>(),
    {
        label: null,
        type: 'button',
        disabled: false,
        href: undefined,
        to: null,
        tooltip: null,
        tooltipSide: 'top',
    }
)

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
            <UiButton
                v-bind="$attrs"
                :disabled="disabled || loading"
                :as
                :href="to ? to : href"
                :to
                :type
                @click="onClick"
            >
                <Icon
                    v-if="loading"
                    name="Loader2"
                    class="animate-spin"
                />

                <span
                    v-else-if="label"
                    class="text-sm"
                >
                    {{ label }}
                </span>

                <slot v-else />
            </UiButton>
        </TooltipTrigger>
        <TooltipContent :side="tooltipSide">
            {{ tooltip }}
        </TooltipContent>
    </Tooltip>
    <UiButton
        v-else
        v-bind="$attrs"
        :disabled="disabled || loading"            
        :as
        :href="to ? to : href"
        :to
        :type
        @click="onClick"
    >
        <Icon
            v-if="loading"
            name="Loader2"
            class="animate-spin"
        />

        <span
            v-else-if="label"
            class="text-sm"
        >
            {{ label }}
        </span>

        <slot v-else />
    </UiButton>
</template>
