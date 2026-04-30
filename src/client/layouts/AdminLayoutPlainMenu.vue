<script lang="ts">
import { computed } from 'vue'
import type MenuItem from '#client/entities/menuItem.entity.ts'

</script>

<script setup lang="ts">
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail
} from '#client/components/ui/sidebar'

defineOptions({
    inheritAttrs: false
})

const props = defineProps({
    items: {
        type: Array as () => MenuItem[],
        required: true
    }
})

interface GroupedMenu {
    id: string
    label: string
    items: MenuItem[]
}

const groupedItems = computed(() => {
    const result = [] as GroupedMenu[]

    for (const item of props.items) {
        const groupName = item.group || $t('General')

        let group = result.find(g => g.id === groupName)

        if (!group) {
            group = {
                id: groupName,
                label: groupName,
                items: []
            }
            result.push(group)
        }

        group.items.push(item)
    }

    return result
})
</script>

<template>
    <SidebarGroup>
        <SidebarMenu>
            <SidebarMenuItem
                v-for="group in groupedItems"
                :key="group.id"
            >
                <SidebarMenuButton class="font-medium">
                    {{ group.label }}
                </SidebarMenuButton>
                <SidebarMenuSub v-if="group.items.length">
                    <SidebarMenuSubItem
                        v-for="item in group.items"
                        :key="item.id"
                    >
                        <SidebarMenuSubButton
                            as-child
                            :is-active="item.to === $route.path"
                        >
                            <RouterLink :to="item.to ?? '#'">
                                {{ item.label }}
                            </RouterLink>
                        </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                </SidebarMenuSub>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarGroup>
    <SidebarRail />
</template>
