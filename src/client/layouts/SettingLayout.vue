<script setup lang="ts">
import { SidebarFooter } from '../components/ui/sidebar'
import BaseLayout from './BaseLayout.vue'
import auth from '#client/facades/auth.ts'
import UserMenu from '#client/components/UserMenu.vue';

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
                <UserMenu
                    :links="userLinks"
                    @logout="auth.logout" 
                />
            </SidebarFooter>
        </template>
    </BaseLayout>>
</template>
