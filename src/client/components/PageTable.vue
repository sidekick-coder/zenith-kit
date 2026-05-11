<script lang="ts" setup>
import { ref } from 'vue'
import { $fetch } from '#client/utils/fetcher.ts'
import AdminLayout from '#client/layouts/AdminLayout.vue'

const props = defineProps({
    url: {
        type: String,
        required: true,
    },
})

const items = ref([])

async function load(){
    const response = await $fetch(props.url)

    items.value = response.data
}

await load()
</script>

<template>
    <AdminLayout>
        <div>items {{ items.length }}</div>
        <div
            v-for="item in items"
            :key="item.id"
        >
            {{ item.id }}
        </div>
    </AdminLayout>
</template>
