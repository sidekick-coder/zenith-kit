<script setup lang="ts">
import { watch, ref, computed, type PropType, } from 'vue'
import Icon from './Icon.vue'
import ZButton from './ZButton.vue'
import FormAutoFieldList from './FormAutoFieldList.vue'
import { useForm } from '#client/composables/useForm.ts'
import { validator } from '#shared/facades/validator.ts'
import type { ValibotObjectSchema } from '#shared/services/ValidatorService.ts'
import DashboardDrawer from './DashboardDrawer.vue'
import { useDashboardWidget } from '#client/composables/useDashboardWidget.ts'

const props = defineProps({
    title: {
        type: String,
        default: 'Widget settings'
    },
    description: {
        type: String,
        default: 'Edit the settings for this widget'
    },
    schema: {
        type: Object as () => ValibotObjectSchema,
        default: () => validator.create(v => v.record(v.string(), v.any()))
    },
    fields: {
        type: [Object, Function] as PropType<Record<string, any> | ((values: any) => Record<string, any>)>,
        default: () => ({})
    },
    values: {
        type: Object as () => Record<string, any>,
        default: () => ({})
    }
})

const widget = useDashboardWidget()

const open = defineModel('open', {
    type: Boolean,
    default: false
})

const { handleSubmit, resetForm, values } = useForm(props.schema, { initialValues: props.values })

const original = ref({} as Record<string, any>)

const innerFields = computed(() => {
    if (typeof props.fields === 'function') {
        return props.fields(values)
    }

    return props.fields
})

function reset() {
    const current = JSON.parse(JSON.stringify(widget.value.options))

    original.value = current

    resetForm({ values: current })
}

function update(){
    for (const key in values) {
        widget.value.setOption(key, values[key])
    }
}

function openDrawer() {
    reset()

    open.value = true
}

function cancel() {
    for (const key in original.value) {
        widget.value.setOption(key, original.value[key])
    }

    open.value = false
}

const onSubmit = handleSubmit((data) => {
    for (const key in data) {
        widget.value.setOption(key, data[key])
    }

    open.value = false
})

watch(values, update, { deep: true })
</script>

<template>
    <ZButton
        size="icon"
        variant="ghost"
        @click="openDrawer"
    >
        <Icon name="Settings" />
    </ZButton>
    <DashboardDrawer
        v-model:open="open"
        :title="title"
        :description="description"
    >
        <form
            id="dashboard-widget-settings-form"
            class="flex flex-col gap-4 px-4 py-4 h-full"
            @submit="onSubmit"
        >
            <div
                v-if="Object.keys(innerFields).length === 0"
                class="text-sm text-muted-foreground text-center h-32 flex items-center justify-center"
            >
                {{ $t('No settings available for this widget.') }}
            </div>

            <FormAutoFieldList :fields="innerFields" />
        </form>

        <template #footer>
            <div class="flex justify-end gap-2">
                <ZButton
                    variant="outline"
                    @click="cancel"
                >
                    {{ $t('Cancel') }}
                </ZButton>
                <ZButton
                    type="submit"
                    form="dashboard-widget-settings-form"
                >
                    {{ $t('Apply') }}
                </ZButton>
            </div>
        </template>
    </DashboardDrawer>
</template>
