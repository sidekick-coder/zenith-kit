<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'
import DropdownMenu from './ui/dropdown-menu/DropdownMenu.vue'
import { DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu'
import { Button } from '#client/components/ui/button'
import { cn } from '#client/lib/utils.ts'

const page = defineModel('page', {
    type: Number,
    required: true,
})

const total = defineModel('total', {
    type: Number,
    required: true,
})

const totalPages = defineModel('totalPages', {
    type: Number,
    required: true,
})


const visiblePages = computed(() => {
    const current = page.value
    const total = totalPages.value
    const pages: number[] = []
    
    if (total <= 3) {
        // Show all pages if total is 3 or less
        for (let i = 1; i <= total; i++) {
            pages.push(i)
        }
        return pages
    }
    
    // Calculate the range of 3 pages to show
    let start = Math.max(1, current - 1)
    const end = Math.min(total, start + 2)
    
    // Adjust start if end is at the boundary
    if (end - start < 2) {
        start = Math.max(1, end - 2)
    }
    
    for (let i = start; i <= end; i++) {
        pages.push(i)
    }
    
    return pages
})

function createArray(from: number, to: number): number[] {
    const arr: number[] = []
    
    for (let i = from; i <= to; i++) {
        arr.push(i)
    }

    return arr
}


</script>

<template>
    <div :class="cn('flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-2 order-1 sm:order-2')">
        <div class="flex items-center  space-x-2">
            <Button
                variant="outline"
                class="w-8 h-8 p-0"
                :disabled="page === 1"
                @click="page = 1"
            >
                <span class="sr-only">{{ $t('Go to first page') }}</span>
                <Icon
                    name="ChevronsLeft"
                    class="w-4 h-4"
                />
            </Button>
            <Button
                variant="outline"
                class="w-8 h-8 p-0"
                :disabled="page === 1"
                @click="page = page - 1"
            >
                <span class="sr-only">{{ $t('Go to previous page') }}</span>
                <Icon
                    name="ChevronLeft"
                    class="w-3 h-3 sm:w-4 sm:h-4"
                />
            </Button>
            <DropdownMenu v-if="!visiblePages.includes(1) && totalPages > 0">
                <DropdownMenuTrigger as-child>
                    <Button
                        variant="outline"
                        class="w-8 h-8 p-0"
                    >
                        <span class="sr-only">{{ $t('More pages') }}</span>
                        <Icon
                            name="MoreHorizontal"
                            class="w-3 h-3 sm:w-4 sm:h-4"
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="max-h-60 overflow-y-auto">
                    <DropdownMenuItem
                        v-for="p of createArray(1, Math.min(...visiblePages) - 1)"
                        :key="p"
                        class="cursor-pointer"
                        @click="page = p"
                    >
                        {{ p }}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button
                v-for="pageNumber in visiblePages"
                :key="pageNumber"
                :variant="page === pageNumber ? 'default' : 'outline'"
                class="w-8 h-8 p-0 hidden sm:flex"
                @click="page = pageNumber"
            >
                {{ pageNumber }}
            </Button>
            <DropdownMenu v-if="!visiblePages.includes(totalPages) && totalPages > 0">
                <DropdownMenuTrigger as-child>
                    <Button
                        variant="outline"
                        class="w-8 h-8 p-0"
                    >
                        <span class="sr-only">{{ $t('More pages') }}</span>
                        <Icon
                            name="MoreHorizontal"
                            class="w-3 h-3 sm:w-4 sm:h-4"
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="max-h-60 overflow-y-auto">
                    <DropdownMenuItem
                        v-for="p of createArray(Math.max(...visiblePages) + 1, totalPages)"
                        :key="p"
                        class="cursor-pointer"
                        @click="page = p"
                    >
                        {{ p }}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button
                variant="outline"
                class="w-8 h-8 p-0"
                :disabled="page === totalPages"
                @click="page = page + 1"
            >
                <span class="sr-only">{{ $t('Go to next page') }}</span>
                <Icon
                    name="ChevronRight"
                    class="w-3 h-3 sm:w-4 sm:h-4"
                />
            </Button>
            <Button
                variant="outline"
                class="w-8 h-8 p-0"
                :disabled="page === totalPages"
                @click="page = totalPages"
            >
                <span class="sr-only">{{ $t('Go to last page') }}</span>
                <Icon
                    name="ChevronsRight"
                    class="w-4 h-4"
                />
            </Button>
        </div>
    </div>
</template>
