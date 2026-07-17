<script setup lang="ts">
import { onMounted, ref } from 'vue'
import DashboardDrawer from './DashboardDrawer.vue'
import ZButton from './ZButton.vue'
import Icon from './Icon.vue'
import { useDashboard } from '#client/composables/useDashboard.ts'
import dashboardRegistry from '#client/facades/dashboardRegistry.ts'
import type DashboardWidgetDefinition from '#client/entities/DashboardWidgetDefinition.ts'

const dashboard = useDashboard()
const open = defineModel('open', {
    type: Boolean,
    default: false
})

const search = defineModel('search', {
    type: String,
    default: ''
})

const items = ref<DashboardWidgetDefinition[]>([])

function load() {
    items.value = dashboardRegistry.list()
}

function add(widgetDef: DashboardWidgetDefinition) {
    dashboard.value.addWidget({
        definition_id: widgetDef.id 
    })

    open.value = false
}

onMounted(load)

</script>

<template>
    <div @click="open = !open">
        <slot />
    </div>
    <DashboardDrawer
        v-model:open="open"
        :title="$t('Add Widget')"
        :description="$t('Add a new widget to your dashboard')"
    >
        <div class="flex flex-col gap-4 px-4 py-2">
            <input
                v-model="search"
                type="text"
                :placeholder="$t('Search widgets...')"
                class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
            <div class="flex flex-col gap-2">
                <div
                    v-for="item in items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))"
                    :key="item.name"
                    class="flex items-center justify-between rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                    <div
                        class="flex items-center gap-2"
                    >
                        <Icon
                            v-if="item.icon"
                            :name="item.icon"
                        />
                        <Icon
                            v-else
                            name="Box"
                        />
                        <div class="flex flex-col gap-1">
                            <span>{{ item.name }}</span>
                            <p class="text-xs text-muted-foreground">
                                {{ item.description }}
                            </p>
                        </div>
                    </div>
                    <ZButton
                        variant="outline"
                        size="sm"
                        @click="add(item)"
                    >
                        {{ $t('Add') }}
                    </ZButton>
                </div>
            </div>
        </div>
    </DashboardDrawer>
</template>
