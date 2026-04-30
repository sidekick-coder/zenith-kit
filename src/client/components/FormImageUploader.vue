<script setup lang="ts">
import { ref } from 'vue'
import Image from './Image.vue'
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '#client/components/ui/form/index.ts'
import FileUploader from '#client/components/FileUploader.vue'
import Button from '#client/components/ZButton.vue'
import Icon from '#client/components/Icon.vue'

import { tryCatch } from '#shared/utils/tryCatch.ts'

defineProps({
    name: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: false,
    },
    hint: {
        type: String,
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    purpose: {
        type: String,
        required: true,
    },
    folder: {
        type: String,
        default: null,
    },
    public: {
        type: Boolean,
        default: false,
    },
    maxSize: {
        type: Number,
        default: 10 * 1024 * 1024, // 10MB default
    },
})

const loading = defineModel<boolean>('loading', {
    type: Boolean,
    default: false,
})

const fileUrl = defineModel<string | undefined | null>('fileUrl', { type: String, })

const fileUploaderRef = ref<InstanceType<typeof FileUploader> | null>(null)

function clearImage() {
    fileUrl.value = null
    
}

async function handlePasteFromClipboard() {
    if (!fileUploaderRef.value) {
        return
    }

    const clipboardItems = await navigator.clipboard.read()
    
    for (const item of clipboardItems) {
        const imageType = item.types.find(type => type.startsWith('image/'))
        
        if (!imageType) {
            continue
        }
        
        const blob = await item.getType(imageType)
        const file = new File([blob], `clipboard-image-${Date.now()}.png`, { type: imageType })
        
        loading.value = true
        
        const [error] = await tryCatch(() => fileUploaderRef.value!.executeFromFile(file))
        
        if (error) {
            loading.value = false
            return
        }
        
        setTimeout(() => {
            loading.value = false
        }, 500)
        
        break
    }
}
</script>

<template>
    <FormField
        v-slot="{ value, setValue }"
        :name
    >
        <FormItem>
            <FormLabel class="mb-2">
                {{ label }}
            </FormLabel>
            <FormControl>
                <div class="flex flex-col items-baseline space-y-4">
                    <!-- Image Preview -->
                    <slot 
                        name="preview"
                        :value="value"
                        :url="fileUrl"
                        :set-value="setValue"
                    >
                        <div
                            v-if="fileUrl"
                            class="relative inline-block border rounded-lg overflow-hidden"
                        >
                            <Image
                                :src="fileUrl"
                                :alt="$t('Uploaded image')"
                                class="max-w-xs max-h-48 object-cover w-full"
                            />
                        </div>
                    </slot>

                    <!-- File Uploader -->
                    <FileUploader
                        ref="fileUploaderRef"
                        v-model:file-url="fileUrl"
                        v-model:loading="loading"
                        :file-id="value"
                        :purpose="purpose"
                        :folder="folder"
                        :max-size="maxSize"
                        :disabled="disabled"
                        :public="public"
                        mimetypes="image/*"
                        @update:file-id="setValue"
                    >
                        <template #default="{ handle, loading: uploading }">
                            <slot 
                                :handle="handle"
                                :loading="uploading"
                                :value="value"
                                :set-value="setValue"
                            >
                                <div class="flex flex-wrap flex-col gap-2 sm:flex-row! sm:gap-2 w-full">
                                    <Button
                                        v-if="value"
                                        type="button"
                                        variant="outline"
                                        :disabled="disabled"
                                        :tooltip="$t('Remove image')"
                                        @click="() => {
                                            clearImage()
                                            setValue(null)
                                        }"
                                    >
                                        <Icon
                                            name="trash"
                                            class="size-4"
                                        />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        :loading="uploading"
                                        :disabled="disabled"
                                        :tooltip="$t('Upload image')"
                                        @click="handle"
                                    >
                                        <Icon
                                            name="Upload"
                                            class="size-4"
                                        />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        :loading="loading"
                                        :disabled="disabled"
                                        :tooltip="$t('Paste from clipboard')"
                                        @click="handlePasteFromClipboard"
                                    >
                                        <Icon
                                            name="Clipboard"
                                            class="size-4"
                                        />
                                    </Button>
                                </div>
                            </slot>
                        </template>
                    </FileUploader>
                </div>
            </FormControl>
            <FormDescription v-if="hint">
                {{ hint }}
            </FormDescription>
            <FormMessage />
        </FormItem>
    </FormField>
</template>
