<script setup lang="ts" generic="T extends Record<string, any> = Record<string, any>">
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '#client/components/ui/table/index.ts'
import { get } from 'lodash-es'
import Checkbox from './ui/checkbox/Checkbox.vue'
import { computed } from 'vue'
import { ArrowUp } from 'lucide-vue-next'
import { cn } from '#client/lib/utils.ts'
import type { DataTableColumn } from '#client/utils/defineColumns.ts'

const props = defineProps({
    itemKey: {
        type: String as () => keyof T | (string & {}),
        default: null
    },
    class: {
        type: String,
        default: ''
    },
    enableSelection: {
        type: Boolean,
        default: false
    },
    disableSort: {
        type: Boolean,
        default: false
    }
})

const selected = defineModel('selected', {
    type: Array as () => (string | number)[],
    default: () => []
})

const loading = defineModel('loading', {
    type: Boolean,
    default: false
})

const rows = defineModel('rows', {
    type: Array as () => T[],
    default: () => []
})

const columns = defineModel('columns', {
    type: Array as () => DataTableColumn<T>[],
    default: () => []
})

const orderBy = defineModel<string | string[] | null>('orderBy', {
    type: [String, Array],
    default: null
})

const orderDirection = defineModel<string | string[] | null>('orderDirection', {
    type: [String, Array],
    default: null
})

const formatedColumns = computed(() => columns.value.map((c, index) => ({
    id: c.id || String(index),
    ...c,
})))

const formated = computed(() => rows.value.map(row => {
    let result = { _raw: row } as any

    for (const c of formatedColumns.value) {
        result[c.id] = findFieldValue(row, c as any)
    }

    return result
}))

function findFieldValue(row: T, column: DataTableColumn<T>) {
    if (typeof column.field === 'function') {
        return column.field(row)
    }

    return get(row, column.field as string)
}

function isSelected(row: T) {
    if (!props.itemKey) return

    const key = get(row, props.itemKey as string)

    if (!key) return

    return selected.value.includes(key)
}

function toggle(row: T) {
    if (!props.itemKey) return

    const key = get(row, props.itemKey as string)

    if (!key) return

    if (!selected.value.includes(key)) {
        selected.value.push(key)
        return
    }

    const index = selected.value.indexOf(key)

    selected.value.splice(index, 1)
}

function getOrderByArray() {
    return Array.isArray(orderBy.value) ? orderBy.value : orderBy.value ? [orderBy.value] : []
}

function getOrderDirectionArray() {
    return Array.isArray(orderDirection.value) ? orderDirection.value : orderDirection.value ? [orderDirection.value] : []
}

function setSort(column: DataTableColumn<T>) {
    if (props.disableSort || column.sortable === false) return

    const obs = getOrderByArray()
    const ods = getOrderDirectionArray()
    const index = obs.indexOf(column.id!)

    if (index !== -1 && ods[index] === 'desc') {
        obs.splice(index, 1)
        ods.splice(index, 1)
    } else if (index !== -1) {
        ods[index] = 'desc'
    } else {
        obs.push(column.id!)
        ods.push('asc')
    }

    orderBy.value = obs
    orderDirection.value = ods
}

function isSorting(column: DataTableColumn<T>) {
    return getOrderByArray().includes(column.id!)
}

function isSortingDesc(column: DataTableColumn<T>) {
    const obs = getOrderByArray()
    const ods = getOrderDirectionArray()
    const index = obs.indexOf(column.id!)
    return index !== -1 && ods[index] === 'desc'
}

</script>

<template>
    <Table :wrapper-class="cn('border rounded-lg', props.class, loading ? 'opacity-50 pointer-events-none' : '')">
        <TableHeader>
            <TableRow>
                <TableHead v-if="enableSelection" class="w-[50px]" />

                <TableHead 
                    v-for="(c, index) of formatedColumns" :key="index" 
                    class="group" 
                    :class="[
                        !disableSort && c.sortable !== false ? 'cursor-pointer select-none' : '',
                    ]"
                    @click="setSort(c)"
                    >
                    <div class="flex items-center">
                        <div class="flex-1">
                            <slot :name="`column-${c.id}`" :column="c">
                                {{ c.label }}
                            </slot>
                        </div>

                        <ArrowUp v-if="!disableSort && c.sortable !== false" :size="12" :class="[
                            isSorting(c) ? '' : 'opacity-0 group-hover:opacity-100',
                            isSortingDesc(c) ? 'rotate-180' : ''
                        ]" />

                    </div>
                </TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <TableRow v-if="formated.length === 0">
                <TableCell :colspan="formatedColumns.length + (enableSelection ? 1 : 0)" class="text-center py-4">
                    {{ $t('No data') }}
                </TableCell>
            </TableRow>
            <TableRow v-for="(r, ri) of formated" :key="ri">
                <TableCell v-if="enableSelection" class="w-[50px]">
                    <Checkbox :model-value="isSelected(r)" @update:model-value="toggle(r)" />
                </TableCell>
                <TableCell v-for="(c, ci) of formatedColumns" :key="ci">
                    <slot :name="`row-${c.id}`" :row="r._raw" :column="c">
                        {{ r[c.id] }}
                    </slot>
                </TableCell>
            </TableRow>
        </TableBody>
    </Table>
</template>
