import type { Response } from 'express'
import { BaseException, LoggerService } from '#shared/index.ts'
import EnvService from './EnvService'

export interface ExceptionServiceOptions {
    ignoreCodeErrors?: number[]
    logger?: LoggerService
    env?: EnvService
}

export default class ExceptionService {
    public static __container_entry_key = 'ExceptionService'
    public ignoreCodeErrors: number[] = [400, 401, 403, 404, 422]
    public logger: LoggerService
    public env: EnvService

    constructor(options: ExceptionServiceOptions = {}) {
        this.logger = options.logger || new LoggerService()
        this.env = options.env || new EnvService()

        if (options.ignoreCodeErrors) {
            this.ignoreCodeErrors = options.ignoreCodeErrors
        }
    }

    public handle(error: Error, response: Response) {

        Object.assign(error, {
            timestamp: new Date().toISOString(),
            status: response.statusCode,
        })



        if (error instanceof BaseException) {

            if (!this.ignoreCodeErrors.includes(error.statusCode)) {
                this.logger.error(error)
            }

            return response.status(error.statusCode).json({
                error: error.name,
                message: error.message,
                stack: this.env.development ? error.stack : undefined,
            })
        }

        this.logger.error(error)

        const data = BaseException.fromError(error)

        return response.status(500).json({
            error: error.name || 'Internal Server Error',
            message: data.message || 'An unexpected error occurred',
        })
    }
}

