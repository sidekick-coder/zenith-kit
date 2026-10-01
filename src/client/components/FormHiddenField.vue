<script setup lang="ts">
defineProps({
    name: {
        type: String,
        required: true,
    },
})
</script>
<template>
    <input class="hidden" :name="name">
</template>
