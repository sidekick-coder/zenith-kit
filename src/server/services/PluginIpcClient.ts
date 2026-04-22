import { createId } from '../../shared/utils/createId.ts'

export type IpcMessage<T = any> = {
    id: string
    event: string
    data: T
}

type IpcListener<T = any> = (data: T) => void

export class PluginIpcClient {
    private listeners = new Map<string, Set<IpcListener>>()
    constructor() {
        process.on('message', (message: IpcMessage) => {
            const handlers = this.listeners.get(message.event)
            if (!handlers) return

            for (const handler of handlers) {
                handler(message.data)
            }
        })
    }

    public on<T = any>(event: string, callback: IpcListener<T>): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set())
        }

        this.listeners.get(event)!.add(callback as IpcListener)
    }

    public off<T = any>(event: string, callback: IpcListener<T>): void {
        this.listeners.get(event)?.delete(callback as IpcListener)
    }

    public emit<T = any>(event: string, data?: T): string {
        if (!process.send) {
            throw new Error('PluginIpcClient.emit: process.send is not available — process was not spawned with IPC channel')
        }

        const id = createId()
        const message: IpcMessage<T> = { id, event, data: data as T }
        process.send(message)

        return id
    }

}

