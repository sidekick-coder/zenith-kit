import { Job } from 'node-schedule'

export interface RoutineHandler {
    (): void | Promise<void>
}

export default class RoutineEntity {
    public id: string
    public cron: string
    public job?: Job

    constructor() {
        if (!this.id) {
            throw new Error('RoutineEntity id is required')
        }

        if (!this.cron) {
            throw new Error('RoutineEntity cron is required')
        }

    }

    public async handle() {
        throw new Error('RoutineEntity handler not implemented')
    }
}
