<script lang="ts">
import { computed, ref  } from 'vue'
import type { PropType } from 'vue'
import { get } from 'lodash-es'
import { syncRef } from '@vueuse/core'
import Checkbox from './ui/checkbox/Checkbox.vue'
import DataTablePagination from './ZDataTablePagination.vue'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '#client/components/ui/table/index.ts'
import {
    Card,
    CardContent,
} from '#client/components/ui/card/index.ts'
import { cn } from '#client/lib/utils.ts'
import { useBreakpoints } from '#client/composables/useBreakpoint.ts'
import { useFetchPagination } from '#client/composables/useFetchPagination.ts'

export interface DataTableFetchParams {
    page: number
    limit: number
}

// export interface DataTableColumn<T extends Record<string, any> = any> {
//     id?: string
//     label?: string
//     field?: keyof T | ((row: T) => any) | (string & {})
//     width?: number
//     cardClass?: string
// }
//
// export function defineColumns<T extends Record<string, any> = any>(columns: DataTableColumn<T>[]){
//     return columns
// }
</script>
<script setup lang="ts" generic="T extends Record<string, any>">

defineOptions({ 
    inheritAttrs: false
})

const props = defineProps({
    selection: {
        type: String as () => 'single' | 'multiple',
        default: null
    },
    class: {
        type: String,
        default: '',
    },
    rowClass: {
        type: [String, Function] as PropType<string | ((row: T) => any)>,
        default: '',
    },
    rowStyle: {
        type: [Object, Function] as PropType<Record<string, any> | ((row: T) => Record<string, any>)>,
        default: () => ({}),
    },
    rowKey: {
        type: [String, Function] as PropType<string | ((row: T) => string | number)>,
        default: null,
    },
    filter: {
        type: Function as PropType<(row: T) => boolean>,
        default: () => true,
    },
    noMobile: {
        type: Boolean,
        default: false,
    },
    hidePagination: {
        type: Boolean,
        default: false,
    },
    fetch: {
        type: String,
        default: null,
    },
    serialize: {
        type: Function as PropType<(row: any) => T>,
        default: (row: any) => row as T,
    },
    refine: {
        type: Function as PropType<(rows: T[]) => T[]>,
        default: null,
    },
})

const emit = defineEmits<{
    'click:row': [item: T]
    'dblclick:row': [item: T]
}>()

interface Slots {
    default(): any
    [key: `header-${string}`]: (props: { column: DataTableColumn }) => any
    [key: `row-${string}`]: (props: { column: DataTableColumn, row: T }) => any
}

defineSlots<Slots>()

const columns = defineModel('columns', {
    type: Array as PropType<DataTableColumn<T>[]>,
    default: () => ([]),
})

const selected = defineModel('selected', {
    type: Array as () => T[],
    default: () => ([]),
})

const fetchQuery = defineModel('fetchQuery', {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
})

let innerRows = ref([] as any[])
let innerPage = ref(1)
let innerTotalPages = ref(1)
let innerTotal = ref(0)
let innerLimit = ref(10)
let innerLoad = async () => {}
let innerReset = async () => {}


// fetch
const pageModel = defineModel('page', {
    type: Number,
    default: 1,
})

const totalPagesModel = defineModel('totalPages', {
    type: Number,
    default: 1,
})

const totalModel = defineModel('total', {
    type: Number,
    default: 0,
})

const limitModel = defineModel('limit', {
    type: Number,
    default: 10,
})

const rowsModel = defineModel('rows', {
    type: Array as () => T[],
    default: () => [],
})


const loading = defineModel('loading', {
    type: Boolean,
    default: false,
})

const breakpoint = defineModel<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('breakpoint', {
    type: String as PropType<'sm' | 'md' | 'lg' | 'xl' | '2xl'>,
    default: 'sm',
})

const breakpoints = useBreakpoints()

const isBreak = breakpoints.smaller(breakpoint)

const shouldBreak = computed(() => {
    if (props.noMobile) return false
    
    return isBreak.value
})

if (props.fetch) {
    const pagination = useFetchPagination<T>(props.fetch, {
        serialize: props.serialize,
        refine: props.refine,
        limit: limitModel.value,
        query: fetchQuery.value,
    })

    innerRows = pagination.items
    innerPage = pagination.page
    innerTotalPages = pagination.totalPages
    innerTotal = pagination.total
    innerLimit = pagination.limit
    innerLoad = pagination.load
    innerReset = pagination.reset

    syncRef(loading, pagination.loading)
    syncRef(fetchQuery, pagination.query)
}

if (!props.fetch) {
    innerRows = rowsModel
    innerPage = pageModel
    innerTotalPages = totalPagesModel
    innerTotal = totalModel
    innerLimit = limitModel
}


function findKey(row: any) {
    if (typeof props.rowKey === 'function') {
        return props.rowKey(row)
    }

    if (typeof props.rowKey === 'string') {
        return get(row, props.rowKey, '')
    }

    return null
}


function findValue(row: any, column: DataTableColumn) {
    if (typeof column.field === 'function') {
        return column.field(row)
    }

    if (column.field) {
        return get(row, column.field, '')
    }

    return ''
}

function findRowClass(row: T) {
    if (typeof props.rowClass === 'function') {
        return props.rowClass(row)
    }

    if (typeof props.rowClass === 'string') {
        return props.rowClass
    }

    return ''
}

function findRowStyle(row: T) {
    if (typeof props.rowStyle === 'function') {
        return props.rowStyle(row)
    }

    if (typeof props.rowStyle === 'object') {
        return props.rowStyle
    }

    return {}
}

function isSelected(row: any) {
    const key = findKey(row)

    if (key) {
        return selected.value.some(i => findKey(i) === key)
    }

    if (props.selection === 'single') {
        return selected.value[0] === row
    }

    if (props.selection === 'multiple') {
        return selected.value.includes(row)
    }

    return false
}

function select(row: any) {
    if (props.selection === 'single') {
        selected.value = [row]
        return
    }

    if (props.selection === 'multiple' && !isSelected(row)) {
        selected.value.push(row)
    }
}

function unselect(row: any) {
    const key = findKey(row) 

    if (key) {
        selected.value = selected.value.filter(i => findKey(i) !== key)
        return
    }
    
    if (props.selection === 'single') {
        selected.value = []
    }

    if (props.selection === 'multiple' && isSelected(row)) {
        selected.value = selected.value.filter(i => i !== row)
    }
}

function toggle(row: any) {
    if (isSelected(row)) {
        return unselect(row)
    }

    select(row)
}

function selectAll(){
    if (props.rowKey) {
        const newSelected = innerRows.value.filter(r => !selected.value.some(s => findKey(r) === findKey(s)))
        selected.value = [...selected.value, ...newSelected]
        return
    }

    const newSelected = innerRows.value.filter(r => !selected.value.includes(r))
    selected.value = [...selected.value, ...newSelected]
}

function unselectAll(){
    if (props.rowKey) {
        selected.value = selected.value.filter(s => !innerRows.value.some(r => findKey(r) === findKey(s)))
        return
    }

    selected.value = selected.value.filter(s => !innerRows.value.includes(s))
}

function toggleAll(){
    const allSelected = innerRows.value.every(isSelected)

    if (allSelected) return unselectAll()

    selectAll()
}


function onClick(item: any){
    emit('click:row', item)
}

defineExpose({
    load: innerLoad,
    reset: innerReset
})

</script>

<template>
    <!-- Desktop Table View -->
    <Table
        v-if="!shouldBreak"
        :wrapper-class="cn('border rounded-lg', props.class, loading ? 'opacity-50 pointer-events-none' : '')"
        v-bind="$attrs"
    >
        <TableHeader>
            <TableRow>
                <TableHead
                    v-if="props.selection === 'multiple'"
                    class="w-10 text-center p-0"
                    :style="{
                        height: 'var(--datatable-th-height, 3rem)'
                    }"
                >
                    <Checkbox
                        class="translate-y-0.5"
                        :model-value="selected.length === innerRows.length && innerRows.length > 0"
                        :indeterminate="selected.length > 0 && selected.length < innerRows.length"
                        @click.stop="toggleAll"
                    />
                </TableHead>
                <TableHead
                    v-for="c in columns"
                    :key="c.id"
                    :style="{
                        width: c.width ? c.width + 'px' : 'auto',
                        height: 'var(--datatable-th-height, 3rem)'
                    }"
                >
                    <slot
                        :name="`header-${c.id}`"
                        :column="c"
                    >
                        {{ c.label }}
                    </slot>
                </TableHead>
            </TableRow>
            <TableRow v-if="loading">
                <TableCell
                    :colspan="columns.length + (props.selection ? 1 : 0)"
                    class="p-0"
                >
                    <div class="h-1 bg-primary w-full animate-pulse" />
                </TableCell>
            </TableRow>
        </TableHeader>
        <TableBody>
            <TableRow v-if="innerRows.length === 0">
                <TableCell
                    :colspan="columns.length + (props.selection ? 1 : 0)"
                    class="text-center"
                    :style="{
                        height: 'var(--datatable-td-height, 3rem)'
                    }"
                >
                    {{ loading ? $t('Loading...') : $t('No data available') }}
                </TableCell>
            </TableRow>

            <TableRow
                v-for="row in innerRows.filter(filter)"
                :key="row.id"
                :data-state="isSelected(row) ? 'selected' : undefined"
                :class="cn('hover:bg-muted/20 ', findRowClass(row))"
                :style="findRowStyle(row)"
                @click="onClick(row)"
                @dblclick="emit('dblclick:row', row.original)"
            >
                <TableCell
                    v-if="props.selection"
                    class="w-10 text-center p-0"
                >
                    <Checkbox
                        class="translate-y-0.5"
                        :model-value="isSelected(row)"
                        @click.stop="toggle(row)"
                    />
                </TableCell>
                <TableCell
                    v-for="c in columns"
                    :key="c.id"
                    :style="{
                        width: c.width ? c.width + 'px' : 'auto',
                        height: 'var(--datatable-td-height, 3rem)'
                    }"
                    class="whitespace-normal"
                >
                    <slot
                        :name="`row-${c.id}`"
                        :column="c"
                        :row="row"
                    >
                        {{ findValue(row, c) }}
                    </slot>
                </TableCell>
            </TableRow>
        </TableBody>
    </Table>

    <!-- Mobile Card View -->
    <div
        v-if="shouldBreak"
        :class="cn('space-y-4', props.class, loading ? 'opacity-50 pointer-events-none' : '')"
        v-bind="$attrs"
    >
        <!-- Loading indicator -->
        <div
            v-if="loading"
            class="h-1 bg-primary w-full animate-pulse rounded"
        />

        <!-- Select all checkbox for mobile -->
        <Card
            v-if="props.selection === 'multiple' && innerRows.length > 0"
            class="py-2"
        >
            <CardContent class="flex items-center gap-2">
                <Checkbox
                    :model-value="selected.length === innerRows.length && innerRows.length > 0"
                    :indeterminate="selected.length > 0 && selected.length < innerRows.length"
                    @click.stop="toggleAll"
                />
                <span class="text-sm text-muted-foreground">
                    {{ $t('Select all') }}
                </span>
            </CardContent>
        </Card>

        <!-- Empty state -->
        <Card v-if="!loading && innerRows.length === 0">
            <CardContent class="text-center py-8">
                {{ $t('No data available') }}
            </CardContent>
        </Card>

        <!-- Cards -->
        <Card
            v-for="row in innerRows"
            :key="row.id"
            :data-state="isSelected(row) ? 'selected' : undefined"
            :class="cn(
                'cursor-pointer transition-colors hover:bg-muted/20',
                isSelected(row) ? 'border-primary bg-primary/5' : '',
                findRowClass(row)
            )"
            @click="onClick(row)"
            @dblclick="emit('dblclick:row', row.original)"
        >
            <CardContent class="p-0">
                <div class="flex items-start gap-2">
                    <Checkbox
                        v-if="props.selection"
                        class="mt-1"
                        :model-value="isSelected(row)"
                        @click.stop="toggle(row)"
                    />
                    <div class="w-full">
                        <div
                            v-for="c in columns"
                            :key="c.id"
                            :class="cn('space-x-4 flex justify-between items-center  overflow-x-auto border-b px-4 py-3 last:border-b-0', c.cardClass)"
                        >
                            <div class="text-xs font-medium text-muted-foreground uppercase tracking-wide min-w-[40%]">
                                <slot
                                    :name="`header-${c.id}`"
                                    :column="c"
                                >
                                    {{ c.label }}
                                </slot>
                            </div>
                            <slot
                                :name="`row-${c.id}`"
                                :column="c"
                                :row="row"
                            >
                                <div class="text-sm font-medium block ">
                                    {{ findValue(row, c) }}
                                </div>
                            </slot>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>

    <DataTablePagination
        v-if="!hidePagination"
        v-model:page="innerPage"
        v-model:limit="innerLimit"
        v-model:total="innerTotal"
        v-model:total-pages="innerTotalPages"
        class="mt-4"
    />
</template>
