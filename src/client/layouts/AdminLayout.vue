<script setup lang="ts">
import { SidebarFooter } from '../components/ui/sidebar'
import BaseLayout from './BaseLayout.vue'
import auth from '#client/facades/auth.ts'
import UserMenu from '#client/components/UserMenu.vue'
import { useLayoutOptions } from '#client/composables/useLayoutOptions.ts'
import { ref, watch } from 'vue'

defineOptions({ inheritAttrs: false, })

const options = useLayoutOptions()
const breadcrumbs = ref([])

const userLinks = [
    {
        label: 'Preferences',
        to: '/admin/menu/items',
        icon: 'Settings',
    }
]

function load(){
    breadcrumbs.value = options.value.breadcrumbs || []
}

watch(options, load, { immediate: true, deep: true })

</script>

<template>
    <BaseLayout layout-id="admin" home-path="/admin" title="Admin" :breadcrumbs="breadcrumbs">
        <slot />

        <template #sidebar-footer>
            <SidebarFooter>
                <UserMenu :links="userLinks" @logout="auth.logout" />
            </SidebarFooter>
        </template>
    </BaseLayout>
</template>
