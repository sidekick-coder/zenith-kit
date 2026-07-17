<script setup lang="ts">
import { nextTick, onMounted, ref, shallowRef } from 'vue'
import DashboardDrawer from './DashboardDrawer.vue'
import DashboardGridUnitInput from './DashboardGridUnitInput.vue'
import Button from '#client/components/ZButton.vue'
import Icon from '#client/components/Icon.vue'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '#client/components/ui/dropdown-menu/index.ts'

import { useDashboard } from '#client/composables/useDashboard.ts'
import type DashboardWidget from '#client/entities/DashboardWidget.ts'
import type { DashboardWidgetAction } from '#client/entities/DashboardWidgetDefinition.ts'
import { provideDashboardWidget } from '#client/composables/useDashboardWidget.ts'

defineOptions({ inheritAttrs: false })

const emit = defineEmits(['remove', 'duplicate'])

const widget = defineModel<DashboardWidget>({
    type: Object,
    required: true,
})

provideDashboardWidget(widget)

const dashboard = useDashboard()
const styles = ref()
const layout = ref(false)
const widgetComponent = shallowRef()
const actions = shallowRef<DashboardWidgetAction[]>([])

function loadStyles() {
    styles.value = widget.value.computeStyles({ contianerWidth: dashboard.value.containerWidth ?? 0, })
}

function loadComponent() {
    const c = widget.value.component()

    if (!c) return

    widgetComponent.value = c
}

function loadActions() {
    actions.value = widget.value.actions()
}

onMounted(loadStyles)
onMounted(loadComponent)
onMounted(loadActions)

widget.value.emmitter.on('widget:updated', loadStyles)

// --- title editing ---
const editing = ref(false)
const inputRef = ref<HTMLInputElement>()

async function startEdit() {
    editing.value = true
    await nextTick()
    if (!inputRef.value) return

    if (widget.value.name) {
        inputRef.value.value = widget.value.name || 'Widget'
    }
    inputRef.value.focus()
    inputRef.value.select()
}

function commitEdit(e: Event) {
    widget.value.name = (e.target as HTMLInputElement).value

    editing.value = false
}

function cancelEdit() {
    editing.value = false
}

function createOptions(from: number, to: number) {
    const options = []

    for (let i = from; i <= to; i++) {
        options.push({
            label: i.toString(),
            value: i
        })
    }

    return options
}
</script>

<template>
    <div :style="styles" class="p-2">
        <div class="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm h-full overflow-hidden">
            <div class="flex items-center gap-2 border-b px-4 py-3">
                <input v-if="editing" ref="inputRef" :placeholder="widget.definition.name || $t('Widget')"
                    class="flex-1 bg-transparent text-sm font-medium outline-none" @keydown.enter="commitEdit"
                    @keydown.esc="cancelEdit" @blur="commitEdit">

                <span v-else class="flex-1 text-sm font-medium" @click="startEdit">
                    {{ widget.name || widget.definition.name || $t('Widget') }}
                </span>

                <div class="flex items-center gap-2">
                    <component :is="action.component" v-for="(action, index) in actions" :key="index"
                        v-bind="action.props" />

                    <Button variant="ghost" size="icon" class="h-7 w-7" @click="layout = true">
                        <Icon name="LayoutGrid" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                            <Button variant="ghost" size="icon" class="h-7 w-7">
                                <Icon name="EllipsisVertical" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <slot name="options" />
                            <DropdownMenuItem @click="emit('duplicate')">
                                <Icon name="Copy" />
                                {{ $t('Duplicate') }}
                            </DropdownMenuItem>
                            <DropdownMenuItem class="text-destructive focus:text-destructive"
                                @click="dashboard.removeWidgetById(widget.id)">
                                <Icon name="Trash" />
                                {{ $t('Remove') }}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div class="flex-1 overflow-hidden">
                <component :is="widgetComponent" v-if="widgetComponent" />

                <div v-else class="flex h-full items-center justify-center text-sm text-muted-foreground">
                    {{ $t('No component found for this widget') }}
                </div>
            </div>
        </div>
    </div>

    <DashboardDrawer v-model:open="layout" :title="$t('Layout')">
        <div class="px-4 py-3">
            <DashboardGridUnitInput v-model="widget.x" :label="$t('Position X')" :options="createOptions(0, 11)" />

            <DashboardGridUnitInput v-model="widget.y" :label="$t('Position Y')" :options="createOptions(0, 10)"
                custom />

            <DashboardGridUnitInput v-model="widget.columns" :label="$t('Columns')" :options="createOptions(1, 12)"
                filled />

            <DashboardGridUnitInput v-model="widget.rows" :label="$t('Rows')" :options="createOptions(1, 10)" filled
                custom />
        </div>
    </DashboardDrawer>
</template>
