<script setup lang="ts">
import { ref } from 'vue'
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
import type ServerFile from '#shared/entities/FileEntity.ts'

defineProps({
    name: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        default: '',
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
        default: 10 * 1024 * 1024,
    },
    mimetypes: {
        type: String,
        default: '*/*',
    },
})

const loading = defineModel<boolean>('loading', {
    type: Boolean,
    default: false,
})

const selectedFile = ref<ServerFile | null>(null)

function setSelectedFile(file: ServerFile) {
    selectedFile.value = file
}

function clearSelectedFile(setValue: (value: null) => void) {
    selectedFile.value = null
    setValue(null)
}
</script>

<template>
    <FormField
        v-slot="{ value, setValue }"
        :name
    >
        <FormItem>
            <FormLabel>{{ label }}</FormLabel>
            <FormControl>
                <div class="flex flex-col gap-3">
                    <FileUploader
                        v-model:loading="loading"
                        :file-id="value"
                        :purpose="purpose"
                        :folder="folder"
                        :max-size="maxSize"
                        :disabled="disabled"
                        :public="public"
                        :mimetypes="mimetypes"
                        @update:file-id="setValue"
                        @uploaded="setSelectedFile"
                    >
                        <template #default="{ handle, loading: uploaderLoading }">
                            <div class="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    :loading="uploaderLoading"
                                    :disabled="disabled"
                                    @click="handle"
                                >
                                    <Icon
                                        name="Upload"
                                        class="size-4 mr-2"
                                    />
                                    {{ value ? $t('Replace') : $t('Upload') }}
                                </Button>

                                <Button
                                    v-if="value"
                                    type="button"
                                    variant="destructive"
                                    :disabled="disabled"
                                    @click="clearSelectedFile(setValue)"
                                >
                                    <Icon
                                        name="X"
                                        class="size-4 mr-2"
                                    />
                                    {{ $t('Clear') }}
                                </Button>
                            </div>
                        </template>
                    </FileUploader>

                    <p
                        v-if="value"
                        class="text-sm text-muted-foreground"
                    >
                        {{ $t('Selected file :0', [selectedFile?.client_name || value]) }}
                    </p>
                </div>
            </FormControl>
            <FormDescription v-if="hint">
                {{ hint }}
            </FormDescription>
            <FormMessage />
        </FormItem>
    </FormField>
</template>
