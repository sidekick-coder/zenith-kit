export interface DataTableColumn<T extends Record<string, any> = Record<string, any>> {
    id?: string
    label?: string
    field?: keyof T | ((row: T) => any) | (string & {})
    sortable?: boolean
    width?: string | number
}

export interface DataTableSort<T extends Record<string, any> = Record<string, any>> {
    key: keyof T | (string & {})
    direction?: 'asc' | 'desc'
}

export function defineColumns<T extends Record<string, any>>(columns: DataTableColumn<T>[]) {
    return columns
}
