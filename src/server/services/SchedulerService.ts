import fs from 'fs'
import path from 'path'
import nodeSchedule from 'node-schedule'
import logger from '../facades/logger.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import { createId } from '#client/utils/createId.ts'
import RoutineEntity from '#server/entities/RoutineEntity.ts'
import { BaseException, LoggerService } from '#shared/index.ts'

export interface AddOptions {
    id?: string
}

export interface SchedulerServiceOptions {
    logger?: LoggerService
    debug?: boolean
}

export interface SchedulerEvents {
    'scheduler:registered': {
        scheduler: SchedulerService
    }
    'scheduler:loaded': {
        scheduler: SchedulerService
    }
    'scheduler:booted': {
        scheduler: SchedulerService
    },
    'scheduler:shutdowned': {
        scheduler: SchedulerService
    }
}

export default class SchedulerService {
    public static __container_entry_key = 'SchedulerService'
    public routines: RoutineEntity[]
    public logger: LoggerService
    public debug: boolean
    public dirs: string[] = []

    constructor(options?: SchedulerServiceOptions) {
        this.routines = []
        this.logger = options?.logger || new LoggerService()
        this.debug = options?.debug || false
    }

    public static create(options?: SchedulerServiceOptions) {
        return new SchedulerService(options)
    }

    public setLogger(logger: LoggerService) {
        this.logger = logger
    }

    public setDebug(debug: boolean) {
        this.debug = debug
    }

    public addDir(dir: string) {
        this.dirs.push(dir)
    }

    public add(routine: Omit<RoutineEntity, 'job'>) {
        const id = routine?.id || createId()

        this.routines.push(routine)

        if (this.debug) {
            this.logger.debug(`${id} routine added`, {
                id: id,
                cron: routine.cron,
            })
        }
    }

    public remove(id: RoutineEntity['id'] | RoutineEntity['id'][]) {
        const ids = Array.isArray(id) ? id : [id]

        this.routines = this.routines.filter(r => !ids.includes(r.id))

        if (this.debug) {
            this.logger.info('routines removed', {
                ids: ids
            })
        }
    }


    public async loadFile(filename: string) {
        if (!fs.existsSync(filename)) {
            this.logger.warn(`File not found: ${filename}`)
            return
        }

        const [error, mod] = await tryCatch(() => import(filename))

        if (error) {
            this.logger.error(`failed to load routines from ${filename}`, error)
            return
        }

        const ctr = mod?.default || mod

        if (!ctr?.is_routine) {
            this.logger.warn(`file does not export a routine: ${filename}`)
            return
        }

        const instance = new ctr()

        instance.id = instance.id || filename

        this.add(instance)

        if (this.debug) {
            this.logger.debug('file loaded', { filename })
        }
    }

    public async loadDirectory(directory: string) {
        if (!fs.existsSync(directory)) {
            logger.warn('directory not found', { directory })
            return
        }

        const files = fs.readdirSync(directory).filter(file => file.endsWith('.ts'))

        for (const file of files) {
            await this.loadFile(path.join(directory, file))
        }
    }

    public async load() {
        for (const dir of this.dirs) {
            await this.loadDirectory(dir)
        }
    }

    public has(id: RoutineEntity['id']): boolean {
        return this.routines.some(routine => routine.id === id)
    }

    public startRoutine(id: RoutineEntity['id']): void {
        const routine = this.routines.find(r => r.id === id)

        if (!routine) {
            throw new BaseException(`RoutineEntity not found: ${id}`)
        }

        if (routine.job) {
            routine.job.cancel()
        }

        const logger = this.logger.child({
            routineId: routine.id,
            routineCron: routine.cron
        })

        const cb = async () => {
            const [error] = await tryCatch(() => routine.handle())

            if (error) {
                logger.error(error.message, error)
                return
            }

            logger.info(`${routine.id} routine executed`)
        }

        routine.job = nodeSchedule.scheduleJob(routine.cron, cb)

        logger.info(`${routine.id} routine started`)
    }


    public async stopRoutine(id: RoutineEntity['id']) {
        const routine = this.routines.find(r => r.id === id)

        if (!routine) {
            throw new BaseException('RoutineEntity not found', 404)
        }

        if (!routine.job) {
            return
        }

        routine.job.cancel()

        this.logger.info(`${routine.id} routine stopped`)
    }


    public async boot() {
        for (const routine of this.routines) {
            this.startRoutine(routine.id)
        }
    }

    public async shutdown() {
        for (const routine of this.routines) {
            await this.stopRoutine(routine.id)
        }
    }

    public list() {
        return this.routines
    }
}
