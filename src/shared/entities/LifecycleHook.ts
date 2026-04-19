export default class LifecycleHook {
    public hook_id: string
    public order?: number
    public subhooks?: LifecycleHook[]
    
    constructor() {
        if (!this.hook_id) {
            this.hook_id = this.constructor.name
        }
    }

    public async onRegister(): Promise<void> {}
    public async onLoad(): Promise<void> {}
    public async onBoot(): Promise<void> {}
    public async onShutdown(): Promise<void> {}

}
