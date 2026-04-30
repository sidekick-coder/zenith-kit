<script setup lang="ts">
import { SidebarFooter } from '../components/ui/sidebar'
import AdminLayoutUserMenu from './AdminLayoutUserMenu.vue'
import BaseLayout from './BaseLayout.vue'
import auth from '#client/facades/auth.ts'

const userLinks = [
    {
        label: 'Preferences',
        to: '/admin/menu/items',
        icon: 'Settings',
    }
]

</script>

<template>
    <BaseLayout
        layout-id="setting"
        home-path="/admin"
        title="Settings"
        menu-variant="plain"
    >
        <slot /> 

        <template #sidebar-footer>
            <SidebarFooter>
                <AdminLayoutUserMenu
                    :links="userLinks"
                    @logout="auth.logout" 
                />
            </SidebarFooter>
        </template>
    </BaseLayout>>
</template>
