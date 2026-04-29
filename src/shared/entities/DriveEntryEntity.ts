export default class DriveEntry {
    public name: string
    public path: string
    public type: 'file' | 'directory'
    public metas: Record<string, any> = {}

    constructor(data: DriveEntry) {
        Object.assign(this, data)
    }
}
