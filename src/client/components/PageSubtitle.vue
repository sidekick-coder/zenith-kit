<script setup lang="ts">
defineProps({
    tag: {
        type: String as () => keyof HTMLElementTagNameMap,
        default: 'h2'
    }
})
</script>
<template>
    <component
        :is="tag"
        class="text-muted-foreground text-base"
    >
        <slot />
    </component>
</template>