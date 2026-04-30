<script setup lang="ts">
import DialogTitle from './ui/dialog/DialogTitle.vue'
import DialogDescription from './ui/dialog/DialogDescription.vue'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from '#client/components/ui/dialog'

defineProps({
    src: {
        type: String,
        required: true,
    },
    alt: {
        type: String,
        default: null,
    },
})

</script>

<template>
    <Dialog>
        <DialogTrigger as-child>
            <img
                :src="src"
                :alt="alt"
                v-bind="$attrs"
            >
        </DialogTrigger>
            
        <DialogContent 
            class="sm:max-w-auto w-auto p-0 h-auto bg-transparent border-0 shadow-none focus:outline-none"
            hide-close
        >
            <DialogTitle class="hidden">
                {{ alt || $t('Image preview') }}
            </DialogTitle>
            <DialogDescription class="hidden">
                {{ alt || $t('Image preview') }}
            </DialogDescription>
            <img
                :src="src"
                :alt="alt"
                class="block h-[100dvw] max-h-[80dvh] rounded-lg object-contain"
            >
        </DialogContent>
    </Dialog>
</template>
