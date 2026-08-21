import { Form as VeeForm, Field as VeeField, FieldArray as VeeFieldArray } from 'vee-validate'

export { default as FormControl } from './FormControl.vue'
export { default as FormDescription } from './FormDescription.vue'
export { default as FormItem } from './FormItem.vue'
export { default as FormLabel } from './FormLabel.vue'
export { default as FormMessage } from './FormMessage.vue'
export { FORM_ITEM_INJECTION_KEY } from './injectionKeys'

const Form = VeeForm
const FormField = VeeField 

const FieldArray = VeeFieldArray 

export { Form, FormField, FieldArray }
