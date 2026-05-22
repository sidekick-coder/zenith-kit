export default class GitBranchEntity {
    public name: string
    public remote: string | null
    public is_current: boolean
    public is_remote: boolean

    constructor(data: GitBranchEntity) {
        Object.assign(this, data)
    }
}
