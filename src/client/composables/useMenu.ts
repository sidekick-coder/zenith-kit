import { computed, ref } from 'vue'

export interface MenuBase {
    id: string
    label: string;
    order?: number;
}

export interface MenuSingle  extends MenuBase {
    icon: string;
    to: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
}

export interface MenuWithChildren extends MenuBase {
    icon: string;
    children: Omit<MenuSingle, 'icon'>[];
}

export interface MenuGroup extends MenuBase {
    group: boolean;
    items: MenuItem[];
}

export interface MenuItem {
    id: string
    label: string;
    to?: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
    group?: string
    order?: number;
    icon?: string
    parent?: string
    layout?: string
}

export type UseMenu = ReturnType<typeof useMenu>

const items = ref<Map<string, MenuItem>>(new Map())

export function useMenu() {
    function add(...item: MenuItem[]) {
        item.forEach(i => {
            if (!i.layout) {
                i.layout = 'admin'
            }
            
            items.value.set(i.id, i)
        })
    }

    function remove(item: MenuItem | MenuItem['id']) {

        if (typeof item === 'string') {
            items.value.delete(item)
        }
    }

    function removeGroup(groupId: string) {
        Array.from(items.value.values())
            .filter(i => i.group === groupId || i.parent === groupId)
            .forEach(i => items.value.delete(i.id))
    }

    function removeMany(itemIds: string[]) {
        itemIds.forEach(id => remove(id))
    }

    function removeManyGroup(groupIds: string[]) {
        groupIds.forEach(id => removeGroup(id))
    }

    function clear() {
        items.value.clear()
    }

    return {
        items: computed(() => Array.from(items.value.values())),
        add,
        remove,
        removeGroup,
        removeMany,
        removeManyGroup,
        clear
    }
}