import type { ChildProcess } from 'node:child_process'
import { createId } from '../../shared/utils/createId.ts'
import type { IpcMessage } from './PluginIpcClient.ts'

type IpcListener<T = any> = (data: T) => void

export class PluginIpcHost {
    private listeners = new Map<string, Set<IpcListener>>()
    constructor(private readonly child: ChildProcess) {
        this.child.on('message', (message: IpcMessage) => {
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
        if (!this.child.send) {
            throw new Error('PluginIpcHost.emit: child process was not spawned with an IPC channel')
        }

        const id = createId()
        const message: IpcMessage<T> = { id, event, data: data as T }
        this.child.send(message)

        return id
    }

}
