export default class PaginationEntity<T = Record<string, any>> {
    public items: T[]
    public total: number
    public page: number
    public per_page: number
    public total_pages: number

    constructor(data: Partial<PaginationEntity>) {
        Object.assign(this, data)
    }

    public static from<T = Record<string, string> >(payload: Partial<PaginationEntity<T>>): PaginationEntity<T> {
        return new PaginationEntity(payload as any)
    }
}
