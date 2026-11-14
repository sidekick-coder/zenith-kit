export default class FileEntity {  
    public id: number
    public drive: string
    public mimetype: string
    public purpose: string
    public client_name: string
    public filename: string
    public public: boolean

    public created_at: Date | string
    public updated_at: Date | string
    public deleted_at?: Date | string | null

    // dynamic
    public url?: string
    public metas?: Record<string, any>

    public isImage(): boolean {
        return this.mimetype.startsWith('image/')
    }
}
