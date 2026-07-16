<script setup lang="ts">
import ZButton from './ZButton.vue'
import Icon from './Icon.vue'

const title = defineModel('title', {
    type: String,
    default: null
})

const description = defineModel('description', {
    type: String,
    default: null
})

const open = defineModel('open', {
    type: Boolean,
    default: false
})

const side = defineModel<'left' | 'right' | 'bottom'>('side', {
    type: String as () => 'left' | 'right' | 'bottom',
    default: 'right'
})

</script>

<template>
    <aside v-if="open" class="fixed inset-0 z-50 flex items-start justify-end bg-black w-full border-l" :class="[
        side === 'left' ? 'left-0 border-r max-w-md' : '',
        side === 'right' ? 'left-auto right-0 border-l max-w-md' : '',
        side === 'bottom' ? 'top-auto bottom-0 left-0 right-0 h-4/12 border-t' : ''
    ]">
        <div class="flex h-full w-full flex-col bg-background">
            <div class="flex items-center justify-between border-b px-4 py-2">
                <div class="flex flex-col gap-1">
                    <div v-if="title" class="font-semibold">
                        {{ title }}
                    </div>
                    <p v-if="description" class="text-xs text-muted-foreground">
                        {{ description }}
                    </p>
                </div>

                <div class="ml-auto flex gap-2">
                    <ZButton v-if="side === 'left'" size="icon" variant="outline" @click="side = 'right'">
                        <Icon name="PanelRightClose" />
                    </ZButton>
                    <ZButton v-else-if="side === 'right'" size="icon" variant="outline" @click="side = 'bottom'">
                        <Icon name="PanelBottomClose" />
                    </ZButton>
                    <ZButton v-else-if="side === 'bottom'" size="icon" variant="outline" @click="side = 'left'">
                        <Icon name="PanelLeftClose" />
                    </ZButton>
                    <ZButton size="icon" variant="outline" @click="open = false">
                        <Icon name="x" />
                    </ZButton>
                </div>
            </div>
            <div class="flex-1 overflow-y-auto">
                <slot />
            </div>
            <div v-if="$slots.footer" class="border-t px-4 py-2">
                <slot name="footer" />
            </div>
        </div>
    </aside>
</template>
