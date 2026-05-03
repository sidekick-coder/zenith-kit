export default class LifecycleHook {
    public hook_id: string
    public order?: number
    public subhooks?: LifecycleHook[]

    constructor() {
        const excluded = ['LifecycleHook', 'default']

        if (!this.hook_id && !excluded.includes(this.constructor.name)) {
            this.hook_id = this.constructor.name
        }
    }

    public async register(): Promise<void> { }
    public async load(): Promise<void> { }
    public async boot(): Promise<void> { }
    public async shutdown(): Promise<void> { }

    /** @deprecated Use register */
    public async onRegister(): Promise<void> { }
    /** @deprecated Use load */
    public async onLoad(): Promise<void> { }
    /** @deprecated Use boot */
    public async onBoot(): Promise<void> { }
    /** @deprecated Use shutdown */
    public async onShutdown(): Promise<void> { }

}
