<script lang="ts" setup>
import { onMounted, shallowRef } from 'vue'
import FormTextarea from './FormTextarea.vue'
import FormSelect from './FormSelect.vue'
import FormAutocomplete from './FormAutocomplete.vue'
import FormSwitch from './FormSwitch.vue'
import FormImageUploader from './FormImageUploader.vue'
import FormColorPicker from './FormColorPicker.vue'
import FormStringListInput from './FormStringListInput.vue'
import FormJsonInput from './FormJsonInput.vue'
import FormDatePicker from './FormDatePicker.vue'
import FormTextField from '#client/components/FormTextField.vue'
import FormFileUploader from '#client/components/FormFileUploader.vue'
import FormHiddenField from './FormHiddenField.vue'
import type { DefineFormField, FormFieldType } from '#client/utils/defineFormFields.ts'

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    field: {
        type: Object as () => DefineFormField,
        default: () => ({}),
    },
})

const comp = shallowRef<any>(null)
const compProps = shallowRef<any>({})

const options: Record<FormFieldType, any> = {
    'text-field': FormTextField,
    textarea: FormTextarea,
    select: FormSelect,
    autocomplete: FormAutocomplete,
    switch: FormSwitch,
    'file-upload': FormFileUploader,
    'image-upload': FormImageUploader,
    'color-picker': FormColorPicker,
    'string-list-input': FormStringListInput,
    'json-input': FormJsonInput,
    'date-picker': FormDatePicker,
    hidden: FormHiddenField,
}

async function load() {
    const { component, ...rest } = props.field

    let componentRef: any = null

    if (typeof component === 'string' && options[component]) {
        componentRef = options[component]
    }

    if (typeof component === 'function') {
        componentRef = component()
    }

    if (!componentRef) {
        console.error(`Component ${component} not found`)
        return
    }

    compProps.value = {
        name: props.name,
        ...rest,
    }

    comp.value = componentRef
}

onMounted(load)

</script>
<template>
    <component v-if="comp" :is="comp" v-bind="compProps" />
    <div v-else class="text-destructive">
        {{ $t('Error rendering field') }}: {{ props.field.component }}
    </div>

</template>
