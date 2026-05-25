import { spawn } from 'child_process'
import LoggerService from '#shared/services/LoggerService.ts'
import ShellExecption from '#shared/exceptions/ShellException.ts'

interface CommandOptions {
    cwd?: string
    env?: NodeJS.ProcessEnv
    shell?: boolean
}

export interface ShellServiceOptions {
    debug?: boolean
    logger?: LoggerService
}

export default class ShellService {
    public static __container_entry_key = 'ShellService'

    public debug: boolean
    public logger: LoggerService

    constructor(options: ShellServiceOptions = {}) {
        this.debug = options.debug ?? false
        this.logger = options.logger || new LoggerService()

        if (this.debug) {
            this.logger.debug('initialized in debug mode')
        }
    }

    /**
     * Execute a shell command and return a promise
     */
    public async command(bin: string, args: string[], options: CommandOptions = {}): Promise<void> {
        return new Promise((resolve, reject) => {
            const child = spawn(bin, args, {
                cwd: options.cwd || process.cwd(),
                stdio: 'pipe',
                shell: options.shell ?? true,
                env: options.env || process.env
            })

            let data = ''

            child.stdout?.on('data', (d) => {
                data += d.toString()
            })

            child.stderr?.on('data', (d) => {
                data += d.toString()
            })

            child.on('close', (code) => {
                if (this.debug) {
                    this.logger.debug('command executed', {
                        bin,
                        args,
                        fullCommand: `${bin} ${args.join(' ')}`,
                        output: data
                    })
                }

                if (code === 0) {
                    return resolve()
                }

                const errorMessage = `Command failed with exit code ${code}`

                this.logger.error(errorMessage, {
                    bin,
                    args,
                    code,
                    output: data
                })

                reject(new ShellExecption(errorMessage, data, bin, args))

            })

            child.on('error', (error) => {
                this.logger.error('Command execution error', {
                    bin,
                    args,
                    fullCommand: `${bin} ${args.join(' ')}`,
                    error: error?.message || error
                })

                reject(error)
            })
        })
    }

    /**
     * Execute a shell command and return the output as a string
     */
    public async executeCommandWithOutput(bin: string, args: string[], options: CommandOptions = {}): Promise<string> {
        if (this.debug) {
            this.logger.debug('executing command', {
                bin,
                args,
                fullCommand: `${bin} ${args.join(' ')}`,
            })
        }
        return new Promise((resolve, reject) => {
            const child = spawn(bin, args, {
                cwd: options.cwd || process.cwd(),
                stdio: 'pipe',
                shell: options.shell !== undefined ? options.shell : true,
                env: options.env || process.env
            })

            let output = ''
            let errorOutput = ''

            child.stdout?.on('data', (data) => {
                output += data.toString()
            })

            child.stderr?.on('data', (data) => {
                errorOutput += data.toString()
            })

            child.on('close', (code) => {
                if (code === 0) {
                    resolve(output.trim())
                } else {
                    const errorMessage = `Command failed with exit code ${code}: ${errorOutput}`
                    this.logger.error(errorMessage, {
                        bin,
                        args,
                        code,
                        fullCommand: `${bin} ${args.join(' ')}`,
                        errorOutput
                    })

                    reject(new ShellExecption(errorMessage, output, bin, args))
                }
            })

            child.on('error', (error) => {
                this.logger.error('Command execution error', {
                    bin,
                    args,
                    error: error.message
                })
                reject(error)
            })
        })
    }
}
