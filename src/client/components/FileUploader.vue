<script setup lang="ts">
import { computed } from 'vue'

import $fetch from '#client/facades/fetch.ts'
import { $file } from '#client/utils/file.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import Button from '#client/components/ZButton.vue'
import Icon from '#client/components/Icon.vue'
import type UploadSession from '#shared/entities/fileUploadSession.entity.ts'
import type ServerFile from '#shared/entities/FileEntity.ts'
import acl from '#client/facades/acl.ts'

const props = defineProps({
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
    public: {
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
    maxSize: {
        type: Number,
        default: 10 * 1024 * 1024, // 10MB default
    },    
    mimetypes: {
        type: String,
        default: '*/*',
    },
    multiple: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits<{
    (e: 'uploaded', response: ServerFile): void
}>()

const fileId = defineModel<number | undefined | null>('fileId', { type: Number, })

const fileUrl = defineModel<string | undefined | null>('fileUrl', { type: String, })

const loading = defineModel<boolean>('loading', {
    type: Boolean,
    default: false,
})

const hasPermission = computed(() => {
    const data = {
        purpose: props.purpose,
        folder: props.folder,
        max_size: props.maxSize,
        mime_types: props.mimetypes,
    }

    return acl.can('create', 'FileUploadSession', data)
})

async function createSession(file: File){
    return await $fetch<UploadSession>('/api/file-upload-sessions', {
        method: 'POST',
        data: {
            public: props.public,
            folder: props.folder,
            client_name: file.name,
            purpose: props.purpose,
            mime_types: props.mimetypes,
            max_size: props.maxSize,
        },
    })
}

async function upload(file: File, url: string) {
    return await $fetch(url, {
        method: 'PUT',
        body: file,
    })
}

async function createServerFile(url: string) {
    return await $fetch<ServerFile>(url, { method: 'POST', })
}
async function executeFromFile(file: File) {
    const session = await createSession(file)

    await upload(file, session.upload_url!)

    const response = await createServerFile(session.create_file_url!)

    fileId.value = response.id
    fileUrl.value = response.url

    return response
}

async function execute() {
    const file = await $file.pick({
        multiple: props.multiple,
        accept: props.mimetypes,
    })
    
    if (!file) {
        return
    }

    if (props.multiple && Array.isArray(file)) {
        const results: ServerFile[] = []
        
        for (const f of file) {
            const response = await executeFromFile(f)
            results.push(response)
        }
        
        return results
    }
    
    if (!Array.isArray(file)) {
        return await executeFromFile(file)
    }
}



async function handle() {
    loading.value = true
    
    const [error, response] = await tryCatch(() => execute())

    if (error || !response) {
        loading.value = false
        return
    }

    setTimeout(() => {
        if (Array.isArray(response)) {
            for (const res of response) {
                emit('uploaded', res)
            }
            
            loading.value = false

            return
        }

        emit('uploaded', response)
        
        loading.value = false
    }, 500)
}

defineExpose({
    handle,
    executeFromFile,
})
</script>

<template>
    <slot
        v-if="hasPermission"
        :handle="handle"
        :loading="loading"
    >
        <Button
            type="button"
            variant="outline"
            :loading="loading"
            :disabled="disabled"
            @click="handle"
        >
            <Icon 
                name="Upload" 
                class="size-4 mr-2" 
            />
            {{ $t('Upload') }}
        </Button>
    </slot>
    <Button
        v-else
        type="button"
        variant="outline"
        disabled
        class="text-xs text-red-600 mt-1 block"
    >
        {{ $t('Missing permissions for file upload') }}
    </Button>
</template>
