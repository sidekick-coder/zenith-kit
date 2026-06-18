import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useState } from './useState.ts'
import type Pagination from '#shared/entities/PaginationEntity.ts'
import $fetch from '#client/facades/fetcher.ts'

export interface UseFetchPaginationOptions {
    key?: string
    query?: Record<string, any>
    serialize?: (item: any) => any
    refine?: (items: any[]) => any[]
    limit?: number
    orderBy?: string | string[] | null
    orderDirection?: 'asc' | 'desc' | ('asc' | 'desc')[] | null
    debounce?: number
    immediate?: boolean
}

const hydrated = new Set<string>()

export function useFetchPagination<T = any>(url: string, options: UseFetchPaginationOptions = {}) {
    const key = options.key || url

    const response = useState<Pagination>(key, {
        default: () => ({
            items: [],
            page: 1,
            total: 0,
            total_pages: 1,
        })
    })

    const loading = ref(false)

    const page = computed({
        get: () => response.value.page,
        set: (value) => { response.value.page = value }
    })

    const query = ref(JSON.parse(JSON.stringify(options.query || {}))) as Ref<Record<string, any>>
    const limit = ref(options.limit || 10)
    const orderBy = ref(options.orderBy || null)
    const orderDirection = ref(options.orderDirection || null)

    const total = computed(() => response.value.total)
    const totalPages = computed(() => response.value.total_pages)
    const items = computed(() => {
        let items = Array.isArray(response.value.items) ? response.value.items : []

        if (options.refine) {
            items = options.refine(items)
        }

        if (options.serialize) {
            return items.map(i => options.serialize!(i)) as T[]
        }

        return items as T[]
    })

    async function load() {
        if (loading.value) return

        loading.value = true

        const params = JSON.parse(JSON.stringify({
            page: page.value,
            limit: limit.value,
            orderBy: orderBy.value ? orderBy.value : undefined,
            orderDirection: orderDirection.value ? orderDirection.value : undefined,
            ...query.value
        }))

        const [error, result] = await $fetch.try<Pagination>(url, {
            method: 'GET',
            query: params
        })

        if (error) {
            loading.value = false
            console.error(error)
            return
        }

        response.value = result

        if (import.meta.env.SSR) {
            loading.value = false
            return
        }

        await new Promise(resolve => setTimeout(resolve, 800))

        loading.value = false
    }

    async function reset() {
        if (page.value === 1) {
            await load()
            return
        }

        page.value = 1
    }

    function onQueryChange(newData: Record<string, any>, oldData: Record<string, any>) {
        const isEqual = JSON.stringify(newData) === JSON.stringify(oldData)

        if (!isEqual) {
            reset()
        }
    }

    watch([page, limit], load)
    watch([orderBy, orderDirection], reset, { deep: true })

    watchDebounced(
        () => JSON.parse(JSON.stringify(query.value)),
        onQueryChange,
        {
            debounce: options.debounce || 1000
        }
    )


    async function hydrate() {
        if (!hydrated.has(key) && items.value.length) {
            hydrated.add(key)
            return
        }

        hydrated.add(key)

        await load()
    }

    return {
        page,
        limit,
        orderBy,
        orderDirection,
        total,
        totalPages,
        items,
        loading,
        load,
        reset,
        query,
        hydrate
    }
}
