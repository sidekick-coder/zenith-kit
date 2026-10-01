export type FormFieldType = 'text-field'
    | 'textarea'
    | 'select'
    | 'autocomplete'
    | 'switch'
    | 'file-upload'
    | 'image-upload'
    | 'color-picker'
    | 'string-list-input'
    | 'json-input'
    | 'date-picker'
    | 'hidden'

export interface DefineFormField {
    component: FormFieldType | (() => Promise<any>) | (() => any)
    [key: string]: any
}

export function defineFormFields(field: Record<string, DefineFormField>) {
    return field
}

