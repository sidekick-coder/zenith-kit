<script setup lang="ts">
import { computed } from 'vue'
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

interface DragState {
    widget: DashboardWidgetEntity
    pointerId: number
    startClientX: number
    startClientY: number
    startX: number
    startY: number
}

let dragState: DragState | null = null

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

function getGridPosition(widget: DashboardWidgetEntity) {
    return {
        x: widget.x.base ?? 0,
        y: widget.y.base ?? 0,
    }
}

function onPointerDown(event: PointerEvent) {
    if (event.button !== 0 || !(event.target instanceof Element)) return

    const handle = event.target.closest('[data-grab-handler]')
    const widgetElement = handle?.closest<HTMLElement>('[data-widget-id]')
    const widgetId = widgetElement?.dataset.widgetId
    const widget = props.widgets.find(item => item.id === widgetId)

    if (!handle || !widget || !dashboard.value.containerWidth) return

    const position = getGridPosition(widget)

    dragState = {
        widget,
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startX: position.x,
        startY: position.y,
    }

    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    event.preventDefault()
}

function onPointerMove(event: PointerEvent) {
    if (!dragState || event.pointerId !== dragState.pointerId) return

    const columnWidth = dashboard.value.containerWidth / 12
    const maxX = Math.max(0, 12 - (dragState.widget.columns.base ?? 1))
    const x = Math.min(maxX, Math.max(0, dragState.startX + Math.round((event.clientX - dragState.startClientX) / columnWidth)))
    const y = Math.max(0, dragState.startY + Math.round((event.clientY - dragState.startClientY) / DASHBOARD_ROW_HEIGHT))

    const currentPosition = getGridPosition(dragState.widget)

    if (currentPosition.x === x && currentPosition.y === y) return

    dragState.widget.update({
        x: { ...dragState.widget.x, base: x },
        y: { ...dragState.widget.y, base: y },
    })
}

function onPointerUp(event: PointerEvent) {
    if (!dragState || event.pointerId !== dragState.pointerId) return

    const body = event.currentTarget as HTMLElement

    if (body.hasPointerCapture(event.pointerId)) {
        body.releasePointerCapture(event.pointerId)
    }

    dragState = null
}
</script>

<template>
    <div
        v-if="widgets.length"
        class="relative h-[calc(100dvh-9rem)] rounded-md overflow-scroll dashboard-body zenith-scrollbar"
        :style="styles"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
    >
        <DashboardWidget
            v-for="widget in widgets"
            :key="widget.id"
            :model-value="widget"
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
    </div>
</template>
