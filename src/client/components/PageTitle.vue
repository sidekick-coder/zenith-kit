<script setup lang="ts">
defineProps({
    tag: {
        type: String as () => keyof HTMLElementTagNameMap,
        default: 'h1'
    }
})
</script>
<template>
    <component
        :is="tag"
        class="text-2xl font-bold"
    >
        <slot />
    </component>
</template>