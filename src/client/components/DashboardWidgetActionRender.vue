<script setup lang="ts">
import type { DashboardWidgetAction } from '#client/entities/DashboardWidgetDefinition.ts';
import { onMounted, shallowRef, type PropType } from 'vue';

const props = defineProps({
    action: {
        type: Object as PropType<DashboardWidgetAction>,
        required: true
    }
})

const comp = shallowRef<any>()

async function load(){
    const c = await props.action.component()

    if (!c) return

    comp.value = c
}

onMounted(load)
</script>
<template>
    <component v-if="comp" :is="comp" v-bind="props.action.props" />
</template>
