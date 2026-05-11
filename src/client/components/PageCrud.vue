<script setup lang="ts" generic="T extends Record<string, any>">
import { ref  } from 'vue'
import type { PropType } from 'vue'
import ZDataTable from '#client/components/ZDataTable.vue'
import ClientOnly from '#client/components/ClientOnly.vue'
import ZButton from '#client/components/ZButton.vue'
import Icon from '#client/components/Icon.vue'
import ZAlertButton from '#client/components/ZAlertButton.vue'
import DialogForm from '#client/components/DialogForm.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'

defineProps({
    title: {
        type: String,
        default: $t('Items')
    },
    description: {
        type: String,
        default: ''
    },
    serialize: {
        type: Function as PropType<(row: any) => T>,
        default: (row: any) => row as T,
    },
    fetch: {
        type: String,
        default: null
    },
    fetchDestroy: {
        type: String,
        default: null
    },
    fetchUpdateMethod: {
        type: String,
        default: 'PUT'
    },
    viewTo: {
        type: String,
        default: null
    },
    actions: {
        type: Array as PropType<Array<'create' | 'edit' | 'destroy'>> ,
        default: () => ['create', 'edit', 'destroy'],
    },
})

const tableRef = ref()

const fetchQuery = defineModel('fetchQuery', {
    type: Object as PropType<Record<string, any>>,
    default: null
})

const loading = defineModel('loading', {
    type: Boolean,
    default: false,
})

const columns = defineModel('columns', {
    type: Array as PropType<Array<any>>,
    default: () => [],
})

const fields = defineModel('fields', {
    type: Object,
    default: () => ({}),
})

const fieldsEdit = defineModel('fieldsEdit', {
    type: Object,
    default: null,
})

function parse(url: string, row: any): string {
    return url.replace(/:([a-zA-Z_]+)/g, (_, key) => row[key]) as string
}

function load(){
    tableRef.value?.load()
}

defineExpose({
    load,
})

</script>

<template>
    <div>
        <div class="flex mb-4 justify-between items-center gap-4">
            <div class="flex-1">
                <PageTitle>
                    {{ title }}
                </PageTitle>
                <PageSubtitle v-if="description">
                    {{ description }}
                </PageSubtitle>
            </div>
            <div class="flex items-center gap-2">
                <ZButton
                    variant="outline"
                    size="icon"
                    :disabled="loading"
                    @click="load"
                >
                    <Icon
                        name="RotateCcw"
                        :class="{ 'animate-spin': loading }"
                    />
                </ZButton>
                <ClientOnly v-if="actions.includes('create')">
                    <DialogForm 
                        :fetch
                        :title="$t('Add new')"
                        :description="$t('Fill in the details below to add a new repository')"
                        :fields="fields"
                        @submit="load"
                    >
                        <ZButton>
                            {{ $t('Add new') }}
                        </ZButton>
                    </DialogForm>
                </ClientOnly>
            </div>
        </div>

        <slot name="header-append" />

        <ZDataTable
            v-if="fetch"
            ref="tableRef"
            v-model:fetch-query="fetchQuery"
            v-model:loading="loading"
            v-model:columns="columns"
            :fetch="fetch"
        >
            <template
                v-for="c in columns.filter(c => c.id !== 'actions')"
                #[`row-${c.id}`]="slotProps"
                :key="c.id"
            >
                <slot
                    :name="`row-${c.id}`"
                    v-bind="slotProps"
                />
            </template>

            <template #row-actions="{ row }">
                <div class="flex items-center gap-2 justify-end">
                    <slot
                        name="prepend-actions"
                        :row="row"
                    />

                    <ZButton
                        v-if="viewTo"
                        size="icon"
                        variant="ghost"
                        :to="parse(viewTo, row)"
                    >
                        <Icon name="Eye" />
                    </ZButton>

                    <DialogForm 
                        v-if="actions.includes('edit')"
                        :fetch="parse(fetch + '/:id', row)"
                        :method="fetchUpdateMethod"
                        :title="$t('Edit')"
                        :description="$t('Fill in the details below to edit')"
                        :fields="fieldsEdit || fields"
                        :values="row"
                        @submit="load"
                    >
                        <ZButton
                            size="icon"
                            variant="ghost"
                        >
                            <Icon name="Edit" />
                        </ZButton>
                    </DialogForm>

                    <ZAlertButton 
                        v-if="actions.includes('destroy')"
                        variant="ghost"
                        size="sm"
                        :fetch="parse(fetchDestroy || fetch, row)"
                        fetch-method="DELETE"
                        @fetched="load"
                    >
                        <Icon name="trash" />
                    </ZAlertButton>
                </div>
            </template>
        </ZDataTable>
    </div>
</template>
