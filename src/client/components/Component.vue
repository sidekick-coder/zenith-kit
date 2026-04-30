<script setup lang="ts">
import type { PropType } from 'vue';

defineProps({
    is: {
        type: [String, Object] as PropType<any>,
        default: null,
    },
})
</script>
<template>
    <component
        :is="is"
        v-if="is"
        v-bind="$attrs"
    >
        <slot />
    </component>

    <slot v-else />
</template>
