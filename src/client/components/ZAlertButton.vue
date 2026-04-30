<script setup lang="ts">
import { toast } from 'vue-sonner'
import Button from './ZButton.vue'
import ClientOnly from './ClientOnly.vue'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '#client/components/ui/alert-dialog/index.ts'

import $fetch from '#client/facades/fetch.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

defineOptions({ inheritAttrs: false })

const props = defineProps({
    title: {
        type: String,
        default: $t('Are you sure?')
    },
    description: {
        type: String,
        default: $t('This action cannot be undone.')
    },
    fetch: {
        type: [String, Function],
        required: false,
        default: undefined
    },
    fetchMethod: {
        type: String,
        default: 'DELETE'
    },
    toastOnSuccess: {
        type: String,
        default: $t('Deleted successfully.')
    },
})

const loading = defineModel('loading', {
    type: Boolean,
    default: false
})

const emit = defineEmits<{
    confirm: []
    fetched: [data: any]
}>()

async function doFetch() {
    if (!props.fetch) return

    loading.value = true

    const [error, response] = await tryCatch(() => {
        if (typeof props.fetch === 'string') {
            return $fetch(props.fetch, { method: props.fetchMethod })
        }

        if (typeof props.fetch === 'function') {
            return props.fetch()
        }        
    })

    if (error) {
        loading.value = false
        return
    }

    setTimeout(() => {
        loading.value = false
        
        if (props.toastOnSuccess) {
            toast.success(props.toastOnSuccess)
        }

        emit('fetched', response)
    }, 500)
}

function onConfirm() {
    if (props.fetch) {
        return doFetch()
    }

    emit('confirm')
}

</script>

<template>
    <ClientOnly>
        <template #fallback>
            <Button
                v-bind="$attrs"
                :loading="loading"
            >
                <slot />
            </Button>
        </template>
        <AlertDialog>
            <AlertDialogTrigger as-child>
                <Button
                    v-bind="$attrs"
                    :loading="loading"
                >
                    <slot />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{{ title }}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {{ description }}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel :disabled="loading">
                        {{ $t('Cancel') }}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        :disabled="loading"
                        @click="onConfirm"
                    >
                        {{ $t('Confirm') }}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </ClientOnly>
</template>
