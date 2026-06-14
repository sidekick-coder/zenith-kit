<script lang="ts">
import { onMounted, ref, watch } from 'vue'
import type MenuItem from '#client/entities/menuItem.entity.ts'
import { parseTo } from '#client/utils/parseTo.ts'

</script>

<script setup lang="ts">
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSubItem,
    SidebarMenuSub
} from '#client/components/ui/sidebar'
import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent
} from '#client/components/ui/collapsible'
import Icon from '#client/components/Icon.vue'

const props = defineProps({
    items: {
        type: Array as () => MenuItem[],
        required: true
    },
    open: {
        type: Boolean,
        default: true
    }
})

const groups = ref<GroupedMenu[]>([])

interface GroupedMenu {
    id: string
    label: string
    open: boolean
    items: any[]
}

function load() {
    const result = [] as GroupedMenu[]
    const items = props.items

    for (const item of items) {
        const group = item.group || 'ungrouped'

        let current = result.find(g => g.id === group)


        if (!current) {
            current = {
                id: group,
                label: group,
                items: [],
                open: true
            }

            result.push(current)
        }

        current.items.push(item)
    }

    groups.value = result
}

function hasChildren(item: MenuItem) {
    return props.items.some(i => i.parent === item.id)
}

load()

onMounted(() => {
    // Initialize group open states from cache
    groups.value.forEach(group => {
        group.open = localStorage.getItem(`sidebar-group-open-${group.id}`) !== 'false'
    })
})

watch(groups, (newGroups) => {
    // Save group open states to cache
    newGroups.forEach(group => {
        localStorage.setItem(`sidebar-group-open-${group.id}`, group.open.toString())
    })

}, { deep: true })

</script>

<template>
    <Collapsible
        v-for="group in groups"
        :key="group.id"
        v-model:open="group.open"
        class="group/collapsible"
    >
        <SidebarGroup :class="open ? '' : 'py-0'">
            <CollapsibleTrigger as-child>
                <SidebarGroupLabel
                    class="p-0"
                    :class="open && group.label !== 'ungrouped' ? '' : 'hidden'"
                >
                    <div class="cursor-pointer hover:bg-muted px-2 py-1 rounded-md flex items-center gap-2">
                        {{ group.label }}
                    </div>
                </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <SidebarMenu>
                    <template
                        v-for="(item, index) in group.items"
                        :key="index"
                    >
                        <Collapsible
                            v-if="hasChildren(item) && open"
                            default-open
                            class="group/collapsible-2"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger as-child>
                                    <SidebarMenuButton :tooltip="item.label">
                                        <Icon :name="item.icon || 'heroicons:cube'" />
                                        <span>{{ item.label }}</span>
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuButton
                                                v-for="child in items.filter(i => i.parent === item.id)"
                                                :key="child.label"
                                                as-child
                                                :is-active="child.to === $route.path"
                                                :tooltip="child.label"
                                            >
                                                <RouterLink :to="parseTo(child.to ?? '#')">
                                                    {{ child.label }}
                                                </RouterLink>
                                            </SidebarMenuButton>
                                        </SidebarMenuSubItem>
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>

                        <SidebarMenuItem v-else>
                            <SidebarMenuButton
                                as-child
                                :is-active="item.to === $route.path"
                                :tooltip="item.label"
                            >
                                <RouterLink
                                    :to="parseTo(item.to ?? '#')"
                                    :target="item.target ?? '_self'"
                                >
                                    <Icon :name="item.icon || 'heroicons:cube'" />
                                    <span>{{ item.label }}</span>
                                </RouterLink>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </template>
                </SidebarMenu>
            </CollapsibleContent>
        </SidebarGroup>
    </Collapsible>
</template>
