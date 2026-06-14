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

        const errorName = error.name || 'Internal Server Error'
        const errorMessage = error.message || 'An unexpected error occurred'
        const errorStatus = (error as any).status || 500

        if (!this.ignoreCodeErrors.includes(errorStatus)) {
            this.logger.error(error)
        }

        return response.status(errorStatus).json({
            error: errorName,
            message: errorMessage,
            status: errorStatus,
        })
    }
}

