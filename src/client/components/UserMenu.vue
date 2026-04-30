<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import auth from '#client/facades/auth.ts'

import $fetch from '#client/facades/fetch.ts'
import di from '#client/facades/container.ts'
import {
    Avatar,
    AvatarFallback,
} from '#client/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '#client/components/ui/dropdown-menu'
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '#client/components/ui/sidebar'
import Icon from '#client/components/Icon.vue'

interface Link {
    label: string
    to: string
    icon?: string
}

const emit = defineEmits(['logout'])

defineProps({
    links: {
        type: Array as () => Link[],
        default: () => [],
    },
})

const { isMobile } = useSidebar()

const userName = computed(() => auth.user?.name || $t('User'))
const userEmail = computed(() => auth.user?.email || '')
const userInitials = computed(() => auth.user?.initials || 'U')

const isDarkMode = ref(false)
const isTogglingDarkMode = ref(false)

onMounted(() => {
    const state = di.get<Record<string, any>>('state')
    const metas = state['user:metas'] || {}
    isDarkMode.value = metas['admin-ui:dark_mode'] ?? false
})

async function toggleDarkMode() {
    if (!auth.user) {
        return
    }

    isTogglingDarkMode.value = true
    isDarkMode.value = !isDarkMode.value

    document.documentElement.classList.toggle('dark', isDarkMode.value)
    document.documentElement.classList.toggle('light', !isDarkMode.value)

    const [error] = await $fetch.try(`/api/users/${auth.user.id}/metas`, {
        method: 'PUT',
        data: [
            {
                name: 'admin-ui:dark_mode',
                value: isDarkMode.value ? 'bool:true' : 'bool:false',
            },
        ],
    })

    if (error) {
        isDarkMode.value = !isDarkMode.value
        document.documentElement.classList.toggle('dark', isDarkMode.value)
        document.documentElement.classList.toggle('light', !isDarkMode.value)
    }

    isTogglingDarkMode.value = false
}

function handleLogout() {
    emit('logout')
}
</script>

<template>
    <SidebarMenu>
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <SidebarMenuButton
                        size="lg"
                        class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <Avatar class="h-8 w-8 rounded-lg">
                            <AvatarFallback class="rounded-lg">
                                {{ userInitials }}
                            </AvatarFallback>
                        </Avatar>
                        <div class="grid flex-1 text-left text-sm leading-tight">
                            <span class="truncate font-medium">{{ userName }}</span>
                            <span class="truncate text-xs">{{ userEmail }}</span>
                        </div>
                        <Icon
                            name="ChevronsUpDown"
                            class="ml-auto size-4"
                        />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    :side="isMobile ? 'bottom' : 'right'"
                    align="start"
                    :side-offset="4"
                >
                    <DropdownMenuLabel class="p-0 font-normal">
                        <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <Avatar class="h-8 w-8 rounded-lg">
                                <AvatarFallback class="rounded-lg">
                                    {{ userInitials }}
                                </AvatarFallback>
                            </Avatar>
                            <div class="grid flex-1 text-left text-sm leading-tight">
                                <span class="truncate font-medium">{{ userName }}</span>
                                <span class="truncate text-xs">{{ userEmail }}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem @click="toggleDarkMode">
                            <Icon
                                v-if="isDarkMode"
                                name="Sun"
                            />
                            <Icon
                                v-else
                                name="Moon"
                            />
                            <span v-if="isDarkMode">{{ $t('Light mode') }}</span>
                            <span v-else>{{ $t('Dark mode') }}</span>
                            <Icon
                                v-if="isTogglingDarkMode"
                                name="Loader2"
                                class="ml-auto animate-spin"
                            />
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuGroup
                        v-for="link in links"
                        :key="link.to"
                    >
                        <DropdownMenuItem as-child>
                            <RouterLink :to="link.to">
                                <Icon
                                    v-if="link.icon"
                                    :name="link.icon"
                                />
                                {{ $t(link.label) }}
                            </RouterLink>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click="handleLogout">
                        <Icon
                            name="LogOut"
                            class="rotate-180"
                        />
                        {{ $t('Logout') }}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    </SidebarMenu>
</template>
