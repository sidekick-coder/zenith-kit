<script lang="ts">
import { toast } from 'vue-sonner'
import {
    ref,
    computed,
    onMounted
} from 'vue'
import type { PropType } from 'vue'
import { useRoute } from 'vue-router'
import { truncate } from 'lodash-es'
import { useHead } from '@unhead/vue'
import menu from '#client/facades/menu.ts'
import AdminLayoutDefaultMenu from './AdminLayoutDefaultMenu.vue'
import AdminLayoutPlainMenu from './AdminLayoutPlainMenu.vue'
import AdminLayoutUserMenu from './AdminLayoutUserMenu.vue'
import Logo from '#client/components/Logo.vue'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '#client/components/ui/breadcrumb'
import {
    Sidebar,
    SidebarInset,
    SidebarTrigger,
    SidebarProvider,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton
} from '#client/components/ui/sidebar'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import Icon from '#client/components/Icon.vue'
import { cn } from '#client/lib/utils.ts'

export interface BreadcrumbItem {
    label: string;
    to?: string;
    icon?: string;
}
</script>
<script setup lang="ts">

defineOptions({ inheritAttrs: false, })

useHead({ bodyAttrs: { class: 'admin', }, })

const open = ref(true)
const loading = ref(true)
const route = useRoute()

const props = defineProps({
    layoutId: {
        type: String,
        required: true,
    },
    padding: {
        type: Boolean,
        default: true,
    },
    hideBreadcrumbs: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: 'Dashboard',
    },
    icon: {
        type: String,
        default: null
    },
    menuVariant: {
        type: String as PropType<'default' | 'plain'>,
        default: 'default',
    },
    homePath: {
        type: String,
        default: '/',
    },
    contentClass: {
        type: String,
        default: '',
    },
    userMenuLinks: {
        type: Array as PropType<{ label: string; to: string; icon?: string }[]>,
        default: () => [],
    },
})

const breadcrumbs = defineModel('breadcrumbs', {
    type: Array as () => BreadcrumbItem[],
    default: null,
})

const items = computed(() =>
    menu.list({
        layout: props.layoutId,
        allowed: true,
    })
)

const computedBreadcrumbs = computed(() => {
    if (breadcrumbs.value) {
        return breadcrumbs.value
    }

    return generateBreadcrumbsFromRoute()
})

function generateBreadcrumbsFromRoute(): BreadcrumbItem[] {
    const pathSegments = route.path.split('/').filter(segment => segment !== '')
    const breadcrumbItems: BreadcrumbItem[] = []

    let currentPath = ''
    for (let i = 0; i < pathSegments.length; i++) {
        currentPath += `/${pathSegments[i]}`
        const segment = pathSegments[i]

        if (segment.startsWith(':')) {
            continue
        }

        const label = segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')

        breadcrumbItems.push({
            label: $t(label),
            to: i === pathSegments.length - 1 ? undefined : currentPath,
        })
    }

    return breadcrumbItems
}

async function onLogout() {
    const [error] = await tryCatch(() => $fetch('/auth/logout', { method: 'POST' }))

    if (error) {
        return
    }

    toast.error($t('You have been logged out.'))

    window.location.href = '/'
}

onMounted(() => {
    loading.value = false
})
</script>

<template>
    <SidebarProvider v-model:open="open">
        <Sidebar
            collapsible="icon"
            variant="inset"
        >
            <slot name="header">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                as-child
                            >
                                <router-link :to="homePath">
                                    <div
                                        v-if="icon"
                                        class="size-8 bg-primary text-primary-foreground flex items-center justify-center rounded-md mr-2"
                                    >
                                        <Icon
                                            :name="icon"
                                            class="text-lg"
                                        />
                                    </div>

                                    <Logo v-else />

                                    <span class="font-medium">
                                        {{ title }}
                                    </span>
                                </router-link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
            </slot>

            <SidebarContent class="gap-0">
                <div v-if="!items.length">
                    <p class="p-4 text-sm text-muted-foreground">
                        {{ $t('No menu items available.') }}
                    </p>
                </div>

                <AdminLayoutDefaultMenu
                    v-else-if="menuVariant === 'default'"
                    :items="items"
                    :open="open"
                />

                <AdminLayoutPlainMenu
                    v-else-if="menuVariant === 'plain'"
                    :items="items"
                    :open="open"
                />
            </SidebarContent>

            <slot
                name="sidebar-footer"
                :open
            >
                <SidebarFooter>
                    <AdminLayoutUserMenu
                        :links="userMenuLinks"
                        @logout="onLogout"
                    />
                </SidebarFooter>
            </slot>
        </Sidebar>

        <SidebarInset variant="sidebar">
            <header
                v-if="!hideBreadcrumbs"
                class="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/70 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4"
            >
                <div class="flex items-center gap-2">
                    <SidebarTrigger class="-ml-1" />

                    <Breadcrumb v-if="computedBreadcrumbs?.length">
                        <BreadcrumbList class="md:hidden">
                            <BreadcrumbItem>
                                <BreadcrumbPage>{{ truncate(computedBreadcrumbs.at(-1)?.label) }}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                        <BreadcrumbList class="hidden md:flex">
                            <template
                                v-for="(item, index) in computedBreadcrumbs"
                                :key="index"
                            >
                                <BreadcrumbItem>
                                    <template v-if="index === computedBreadcrumbs.length - 1">
                                        <BreadcrumbPage>{{ truncate(item.label) }}</BreadcrumbPage>
                                    </template>
                                    <template v-else>
                                        <BreadcrumbLink as-child>
                                            <RouterLink :to="item.to!">
                                                {{ truncate(item.label) }}
                                            </RouterLink>
                                        </BreadcrumbLink>
                                    </template>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator v-if="index !== computedBreadcrumbs.length - 1" />
                            </template>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <div>
                <div
                    :class="cn(
                        'dashboard-layout-content h-full overflow-auto lg:max-w-[calc(100dvw-8px-var(--sidebar-width))] group-has-data-[collapsible=icon]/sidebar-wrapper:max-w-[calc(100dvw-var(--sidebar-width-icon))]',
                        padding ? 'p-5' : '',
                        contentClass
                    )"
                >
                    <slot />
                </div>
            </div>
        </SidebarInset>
    </SidebarProvider>
</template>
