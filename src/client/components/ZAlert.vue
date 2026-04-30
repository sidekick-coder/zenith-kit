<script setup lang="ts">
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
} from '#client/components/ui/alert-dialog'


defineProps({
    title: {
        type: String,
        default: $t('Are you sure?')
    },
    description: {
        type: String,
        default: $t('This action cannot be undone.')
    }
})

const emit = defineEmits<{
    confirm: []
}>()

</script>

<template>
    <AlertDialog>
        <AlertDialogTrigger>
            <slot />
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{{ title }}</AlertDialogTitle>
                <AlertDialogDescription>
                    {{ description }}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>{{ $t('Cancel') }}</AlertDialogCancel>
                <AlertDialogAction @click="emit('confirm')">
                    {{ $t('Confirm') }}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>
