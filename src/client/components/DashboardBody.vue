<script setup lang="ts">
import { computed } from 'vue'
import Button from '#client/components/ZButton.vue'
import Icon from '#client/components/Icon.vue'
import DashboardWidget from '#client/components/DashboardWidget.vue'
import { useDashboard } from '#client/composables/useDashboard.ts'
import DashboardWidgetEntity, { DASHBOARD_ROW_HEIGHT } from '#client/entities/DashboardWidget.ts'

const props = defineProps({
    widgets: {
        type: Array as () => DashboardWidgetEntity[],
        required: false,
        default: () => []
    }
})

const dashboard = useDashboard()

const emit = defineEmits(['add-widget', 'update:widgets'])

function removeWidget(index: number) {
    emit('update:widgets', props.widgets.filter((_, i) => i !== index))
}

function duplicateWidget(index: number) {
    const copy = JSON.parse(JSON.stringify(props.widgets[index]))
    const updated = [...props.widgets]
    updated.splice(index + 1, 0, copy)
    emit('update:widgets', updated)
}

const styles = computed(() => {
    const tileHeight = DASHBOARD_ROW_HEIGHT
    const tileWidth = dashboard.value.containerWidth / 12

    return {
        'background-size': `${tileWidth}px ${tileHeight}px`,
        'background-image': 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        'background-position': '0 0, 0 0',
        'background-repeat': 'repeat, repeat',
        'border': '1px solid rgba(255, 255, 255, 0.05)',
    }
})
</script>

<template>
    <div
        v-if="widgets.length"
        class="relative h-[calc(100dvh-9rem)] rounded-md overflow-scroll dashboard-body zenith-scrollbar"
        :style="styles"
    >
        <DashboardWidget
            v-for="(widget, index) in widgets"
            :key="index"
            :model-value="widget"
            @duplicate="duplicateWidget(index)"
            @remove="removeWidget(index)"
        />
    </div>

    <div
        v-else
        class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 py-20 text-center"
    >
        <Icon
            name="LayoutDashboard"
            class="mb-3 size-12 text-muted-foreground"
        />
        <p class="mb-4 text-sm text-muted-foreground">
            {{ $t('No widgets added yet') }}
        </p>
        <Button
            type="button"
            variant="outline"
            @click="emit('add-widget')"
        >
            <Icon name="Plus" />
            {{ $t('Add widget') }}
        </Button>
    </div>
</template>
