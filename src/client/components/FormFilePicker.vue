<script setup lang="ts">
import { ref } from 'vue'
import { useField } from 'vee-validate'
import { toast } from 'vue-sonner'

import { $fetch } from '#client/utils/fetcher.ts'
import { $file } from '#client/utils/file.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '#client/components/ui/form/index.ts'
import Button from '#client/components/ZButton.vue'
import Icon from '#client/components/Icon.vue'

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    hint: {
        type: String,
        default: '',
    },
    accept: {
        type: String,
        default: '*/*',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    public: {
        type: Boolean,
        default: false,
    },
    showPreview: {
        type: Boolean,
        default: true,
    },
    previewSize: {
        type: String,
        default: 'size-32',
    },
})

const uploading = ref(false)
const { setValue, value } = useField(props.name)

async function handleFilePick() {
    const file = await $file.pick({
        multiple: false,
        accept: props.accept,
    })
    
    if (!file) {
        return
    }

    uploading.value = true

    const form = new FormData()
    form.append('file', file)

    const [error, response] = await tryCatch(() => $fetch('/api/files/upload', {
        method: 'POST',
        body: form,
        query: props.public ? { public: true } : {},
    }))

    if (error) {
        uploading.value = false
        return
    }

    setValue(String(response.id))
    toast.success($t('File uploaded successfully.'))
    
    setTimeout(() => {
        uploading.value = false
    }, 500)
}

function handleRemove() {
    setValue('')
    toast.success($t('File removed successfully.'))
}
</script>

<template>
    <FormField
        :name
        :validate-on-blur="false"
    >
        <FormItem>
            <FormLabel>{{ label }}</FormLabel>
            <FormControl>
                <div class="space-y-3">
                    <!-- File Preview -->
                    <div class="space-y-3">
                        <slot
                            name="preview"
                            :value="value"
                        >
                            <div class="border rounded-lg p-4 bg-muted/50">
                                <div class="flex items-center justify-center p-8 text-muted-foreground">
                                    <Icon 
                                        name="File" 
                                        class="size-12"
                                    />
                                </div>
                            </div>
                        </slot>
                        <div class="flex gap-2">
                            <Button
                                v-if="!value"
                                type="button"
                                variant="outline"
                                size="sm"
                                class="w-full"
                                :loading="uploading"
                                :disabled="disabled"
                                @click="handleFilePick"
                            >
                                <Icon 
                                    name="Upload" 
                                    class="size-4 mr-2" 
                                />
                                {{ $t('Upload') }}
                            </Button>

                            <Button
                                v-if="value"
                                type="button"
                                variant="outline"
                                size="sm"
                                :loading="uploading"
                                :disabled="disabled"
                                @click="handleFilePick"
                            >
                                <Icon 
                                    name="Upload" 
                                    class="size-4 mr-2" 
                                />
                                {{ $t('Replace') }}
                            </Button>
                            <Button
                                v-if="value"
                                type="button"
                                variant="outline"
                                size="sm"
                                :disabled="disabled || uploading"
                                @click="handleRemove"
                            >
                                <Icon 
                                    name="Trash2" 
                                    class="size-4 mr-2" 
                                />
                                {{ $t('Remove') }}
                            </Button>
                        </div>
                    </div>
                </div>
            </FormControl>
            <FormDescription v-if="hint">
                {{ hint }}
            </FormDescription>
            <FormMessage />
        </FormItem>
    </FormField>
</template>
