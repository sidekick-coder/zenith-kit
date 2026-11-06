import type { ClassValue } from "vue"

export interface DataTableColumn<T extends Record<string, any> = Record<string, any>> {
    id?: string
    label?: string
    field?: keyof T | ((row: T) => any) | (string & {})
    sortable?: boolean
    class?: ClassValue
}

export function defineColumns<T extends Record<string, any>>(columns: DataTableColumn<T>[]) {
    return columns
}
