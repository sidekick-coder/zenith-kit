export default class FileMeta  {  
    public id: number
    public file_id: number
    public name: string
    public value: string | null

    public created_at: Date | string
    public updated_at: Date | string
    public deleted_at?: Date | string | null
}
