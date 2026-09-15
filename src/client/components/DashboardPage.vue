<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { DashboardSchema } from '#shared/schemas/dashboardSchema'
import fetcher from '#client/facades/fetcher'
import toast from '#client/facades/toast'
import PageTitle from './PageTitle.vue'
import PageSubtitle from './PageSubtitle.vue'
import DashboardBody from './DashboardBody.vue'
import DashboardAddWidgetDrawer from './DashboardAddWidgetDrawer.vue'
import Button from './ZButton.vue'
import Icon from './Icon.vue'
import { provideDashboard } from '#client/composables/useDashboard'
import DashboardEntity from '#client/entities/Dashboard'
import DashboardWidgetData from '#client/entities/DashboardWidgetData'

const props = defineProps({
    dashboardId: {
        type: [String, Number],
        required: false
    }
})

const dashboard = ref(new DashboardEntity())
const body = ref<InstanceType<typeof DashboardBody>>()

provideDashboard(dashboard)

const loading = ref(false)
const saving = ref(false)
const dashboardData = ref<DashboardSchema>()
const metas = ref<any>({})

async function load() {
    loading.value = true

    const [error, response] = await fetcher.try(`/api/dashboards/${props.dashboardId}`, { query: { with: 'metas' } })

    if (error) {
        loading.value = false
        return
    }

    dashboardData.value = response
    metas.value = response.metas

    let widgets: any[] = response.metas?.widgets ?? []

    widgets = widgets.map(w => new DashboardWidgetData(w))

    dashboard.value
        .setName(response.name)
        .setDescription(response.description)
        .setWidgets(widgets)

    await new Promise(resolve => setTimeout(resolve, 500))

    loading.value = false
}

async function save() {
    saving.value = true

    const widgets = dashboard.value.widgets.map(w => ({
        id: w.id,
        name: w.name,
        definition_id: w.definition_id,
        x: w.x,
        y: w.y,
        columns: w.columns,
        rows: w.rows,
        options: w.options
    }))

    const data = {
        ...metas.value,
        widgets
    }

    const [error] = await fetcher.try(`/api/dashboards/${props.dashboardId}/metas`, {
        method: 'PUT',
        data
    })

    if (error) {
        saving.value = false
        return
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    saving.value = false

    toast.success($t('Dashboard saved successfully'))

    await load()
}

function loadBody() {
    if (!body.value?.$el) return

    const el = body.value.$el as HTMLElement

    const width = el.offsetWidth

    dashboard.value.setContainerWidth(width)
}

onMounted(load)
onMounted(loadBody)
</script>

<template>
    <div>
        <div class="mb-6 flex items-center">
            <div class="flex-1">
                <PageTitle>
                    {{ dashboard.name || $t('Loading...') }}
                </PageTitle>
                <PageSubtitle v-if="dashboard.description">
                    {{ dashboard.description }}
                </PageSubtitle>
            </div>
            <div class="flex items-center gap-2">
                <DashboardAddWidgetDrawer>
                    <Button
                        type="button"
                        variant="outline"
                        :disabled="loading"
                    >
                        <Icon name="Plus" />
                        {{ $t('Add widget') }}
                    </Button>
                </DashboardAddWidgetDrawer>
                <Button
                    variant="outline"
                    size="icon"
                    :disabled="loading"
                    @click="load"
                >
                    <Icon
                        name="RotateCcw"
                        :class="{ 'animate-spin': loading }"
                    />
                </Button>
                <Button
                    type="submit"
                    :loading="saving"
                    :disabled="loading"
                    @click="save"
                >
                    {{ $t('Save') }}
                </Button>
            </div>
        </div>
    </div>

    <DashboardBody
        v-if="!loading"
        ref="body"
        :widgets="dashboard.widgets"
    />
</template>

