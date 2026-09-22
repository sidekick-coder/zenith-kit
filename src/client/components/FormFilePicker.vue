<script setup lang="ts">
import { computed } from 'vue'
import { useField } from 'vee-validate'
import { $file } from '#client/utils/file.ts'
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
import toast from '#client/facades/toast.ts'
import { cn } from '#client/lib/utils.ts'

defineOptions({
    inheritAttrs: false,
})

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
    class: {
        type: String,
        default: '',
    },
})

const classes = computed(() => cn(props.class))

const { setValue, value } = useField<File | null | undefined>(props.name)

async function handleFilePick() {
    const file = await $file.pick({
        multiple: false,
        accept: props.accept,
    })

    if (!file) {
        return
    }

    setValue(file)

}

function handleRemove() {
    setValue(undefined)

    toast.success($t('File removed successfully.'))
}
</script>

<template>
    <FormField :name :validate-on-blur="false">
        <FormItem :class="classes">
            <FormLabel>{{ label }}</FormLabel>
            <FormControl>
                <div class="space-y-3">
                    <!-- File Preview -->
                    <div class="space-y-3">
                        <slot name="preview" :value="value">
                            <div class="border rounded-lg p-4 bg-muted/50">
                                <div class="flex items-center justify-center p-8 text-muted-foreground">
                                    <Icon name="File" class="size-12" />
                                </div>
                                <div v-if="value" class="text-center text-sm text-muted-foreground">
                                    {{ value.name }}
                                </div>
                            </div>
                        </slot>
                        <div class="flex gap-2">
                            <Button v-if="!value" type="button" variant="outline" size="sm" class="w-full"
                                :disabled="disabled" @click="handleFilePick">
                                <Icon name="Upload" class="size-4 mr-2" />
                                {{ $t('Upload') }}
                            </Button>

                            <Button v-if="value" type="button" variant="outline" size="sm" :disabled="disabled"
                                @click="handleFilePick">
                                <Icon name="Upload" class="size-4 mr-2" />
                                {{ $t('Replace') }}
                            </Button>
                            <Button v-if="value" type="button" variant="outline" size="sm" :disabled="disabled"
                                @click="handleRemove">
                                <Icon name="Trash2" class="size-4 mr-2" />
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
