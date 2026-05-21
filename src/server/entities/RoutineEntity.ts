import { Job } from 'node-schedule'

export interface RoutineHandler {
    (): void | Promise<void>
}

export interface RoutineEntityOptions {
    id: string
    cron: string
    handler?: RoutineHandler
}

export default class RoutineEntity {
    public id: string
    public cron: string
    public job?: Job

    public static create(){
        return new RoutineEntity()
    }

    public handle: RoutineHandler = () => {
        throw new Error('RoutineEntity handler not implemented')
    }

    public setId(id: string) {
        this.id = id

        return this
    }

    public setCron(cron: string) {
        this.cron = cron

        return this
    }

    public setHandler(handler: RoutineHandler) {
        this.handle = handler

        return this
    }
}
