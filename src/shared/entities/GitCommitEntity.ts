export default class GitCommitEntity {
    public hash: string
    public short_hash: string
    public message: string
    public body: string
    public author_name: string
    public author_email: string
    public date: string

    constructor(data: GitCommitEntity) {
        Object.assign(this, data)
    }
}
