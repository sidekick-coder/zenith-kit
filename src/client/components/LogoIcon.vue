<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

defineOptions({ inheritAttrs: false, })

interface Props {
    className?: HTMLAttributes['class'];
}

defineProps<Props>()
</script>

<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 40 42"
        :class="className"
        v-bind="$attrs"
    >
        <path
            d="M8 9
                                  L31 9
                                  L8 33
                                  L31 33"
            stroke="currentColor"
            stroke-width="4"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
</template>
