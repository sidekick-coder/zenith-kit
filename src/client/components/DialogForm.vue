<script lang="ts">
export function defineLegacyDialogFormFields<T extends Record<string, FormField | ((data: any) => FormField)>>(field: T) {
    return field
}
</script>
<script lang="ts" setup generic="T extends BaseSchema<any, any, any>">
import { useForm } from 'vee-validate'
import * as v from 'valibot'
import { toTypedSchema } from '@vee-validate/valibot'
import { computed, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { BaseSchema } from 'valibot'
import { toast } from 'vue-sonner'
import ClientOnly from './ClientOnly.vue'
import FormAutoFieldList from './FormAutoFieldList.vue'
import type { FormField } from './FormAutoFieldList.vue'

import $fetch from '#client/facades/fetcher.ts'
import Button from '#client/components/ZButton.vue'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '#client/components/ui/dialog/index.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import { validator } from '#shared/index.ts'

const props = defineProps({
    title: {
        type: String,
        default: $t('Form'),
    },
    description: {
        type: String,
        default: $t('Fill in the details below to create a new item'),
    },
    schema: {
        type: Object as () => T,
        default: () => validator.create(v => v.record(v.string(), v.any())), // dummy schema to satisfy generic constraint
    },
    values: {
        type: Object as () => Partial<v.InferInput<T>>,
        default: () => ({}),
    },
    fetch: {
        type: [String, Function] as PropType<string | ((data: any) => Promise<any>)>,
        default: null,
    },
    fetchMethod: {
        type: String,
        default: 'POST',
    },
    /** @deprecated use fetchMethod instead */
    method: {
        type: String,
        default: null,
    },
    handle: {
        type: Function as PropType<(data: v.InferInput<T>) => Promise<any>>,
        default: null,
    },
    fields: {
        type: Object as () => Record<keyof v.InferInput<T>, FormField | ((data: any) => FormField)>,
        default: () => ({}),
    },
    submitText: {
        type: String,
        default: $t('Save'),
    },
    toastOnSuccess: {
        type: String,
        default: null,
    },
})

const emit = defineEmits(['submit'])

const loading = ref(false)

const open = defineModel('open', {
    type: Boolean,
    default: false,
})

const { handleSubmit, errors, values, resetForm, setFieldValue } = useForm({
    validationSchema: toTypedSchema(props.schema as T),
    initialValues: props.values as v.InferInput<T>,
})

const formatedFields = computed(() => {
    const result: Record<string, FormField> = {}

    for (const [key, field] of Object.entries(props.fields)) {
        if (typeof field === 'function') {
            result[key] = field(values)
        } else {
            result[key] = field
        }
    }

    return result
})

const errorsWihoutFields = computed(() => {
    const result: Record<string, any> = {}

    for (const [key, value] of Object.entries(errors.value)) {
        if (props.fields[key as keyof v.InferInput<T>]) continue

        result[key] = value
    }

    return result
})

function doFetch(data: v.InferInput<T>) {
    if (typeof props.fetch === 'function') {
        return props.fetch(data)
    }

    return $fetch.fetch(props.fetch as string, {
        method: props.method || props.fetchMethod,
        data,
    })
}

const onSubmit = handleSubmit(async (data) => {
    if (!props.fetch && !props.handle) {
        open.value = false
        return
    }

    loading.value = true

    const [error, response] = await tryCatch(() => {
        if (props.handle) {
            return props.handle(data)
        }

        return doFetch(data)
    })

    if (error) {
        loading.value = false
        console.error(error)
        return
    }

    if (props.toastOnSuccess) {
        toast.success(props.toastOnSuccess)
    }

    await new Promise(resolve => setTimeout(resolve, 1000)) // wait for animation to finish

    open.value = false
    loading.value = false
    resetForm()
    emit('submit', response)
})

watch(open, () => {
    if (!open.value) return

    resetForm({ values: props.values as v.InferInput<T>, })
})

defineExpose({ setFieldValue, })
</script>
<template>
    <ClientOnly>
        <template #fallback>
            <slot />
        </template>

        <Dialog v-model:open="open">
            <DialogTrigger v-if="$slots.default">
                <slot />
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{{ title }}</DialogTitle>
                    <DialogDescription>{{ description }}</DialogDescription>
                </DialogHeader>
                <form class="space-y-4 py-2" @submit.prevent="onSubmit">
                    <FormAutoFieldList :fields="formatedFields" />

                    <div v-if="Object.keys(errorsWihoutFields).length" class="mb-2 text-sm text-red-600">
                        <div v-for="(message, field) in errorsWihoutFields" :key="field">
                            {{ message }}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" class="w-full" :loading>
                            {{ submitText }}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </ClientOnly>
</template>
