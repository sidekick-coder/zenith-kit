<script lang="ts" setup>
import type { DefineFormField } from '#client/utils/defineFormFields.ts'
import FormAutoFieldRender from './FormAutoFieldRender.vue'

defineProps({
    fields: {
        type: Object as () => Record<string, DefineFormField>,
        default: () => ({}),
    },
})

</script>
<template>
    <FormAutoFieldRender v-for="(field, key) in fields" :key="key" :name="key" :field="field" />
    <!-- <template v-for="field in components" :key="field.name"> -->
    <!--     <FormTextField v-if="field.component === 'text-field'" :name="field.name" v-bind="field.props" /> -->
    <!---->
    <!--     <FormTextarea v-else-if="field.component === 'textarea'" :name="field.name" v-bind="field.props" /> -->
    <!---->
    <!--     <FormSelect v-else-if="field.component === 'select'" :name="field.name" v-bind="field.props" /> -->
    <!---->
    <!--     <FormAutocomplete v-else-if="field.component === 'autocomplete'" :name="field.name" v-bind="field.props" /> -->
    <!---->
    <!--     <FormSwitch v-else-if="field.component === 'switch'" :name="field.name" v-bind="field.props" /> -->
    <!---->
    <!--     <FormFileUploader v-else-if="field.component === 'file-upload'" :name="field.name" v-bind="field.props" /> -->
    <!---->
    <!--     <FormImageUploader v-else-if="field.component === 'image-upload'" :name="field.name" v-bind="field.props" /> -->
    <!---->
    <!--     <FormColorPicker v-else-if="field.component === 'color-picker'" :name="field.name" v-bind="field.props" /> -->
    <!---->
    <!--     <FormStringListInput v-else-if="field.component === 'string-list-input'" :name="field.name" -->
    <!--         v-bind="field.props" /> -->
    <!---->
    <!--     <FormJsonInput v-else-if="field.component === 'json-input'" :name="field.name" v-bind="field.props" /> -->
    <!---->
    <!--     <FormDatePicker v-else-if="field.component === 'date-picker'" :name="field.name" v-bind="field.props" /> -->
    <!---->
    <!--     <input v-else-if="field.component === 'hidden'" class="hidden" :name="field.name"> -->
    <!---->
    <!--     <component v-else-if="field.component" :is="field.component" :name="field.name" v-bind="field.props" /> -->
    <!---->
    <!--     <div v-else class="text-destructive"> -->
    <!--         Unknow component {{ field.component }} -->
    <!--     </div> -->
    <!---->
    <!-- </template> -->
</template>
