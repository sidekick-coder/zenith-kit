import dotenv from 'dotenv'
import * as v from 'valibot'
import BaseException from '#shared/exceptions/BaseException.ts'
import { envSchema } from '#server/schemas/envSchema.ts'
import type { EnvSchema } from '#server/schemas/envSchema.ts'

export default class EnvService {
    private env: EnvSchema | null = null
    private files: string[] = []

    public static dotEnvConfig(options?: dotenv.DotenvConfigOptions) {
        return dotenv.config(options)
    }

    public setFiles(files: string[]) {
        this.files = files
        return this
    }

    public addFile(file: string) {
        this.files.push(file)
        return this
    }

    public load() {
        EnvService.dotEnvConfig({
            path: this.files,
            override: true,
            quiet: true,
        })

        this.env = v.parse(envSchema, process.env)

        return this.env
    }

    public get production(): boolean {
        return this.get('NODE_ENV') === 'production'
    }

    public get development(): boolean {
        return this.get('NODE_ENV') === 'development'
    }

    public get test(): boolean {
        return this.get('NODE_ENV') === 'test'
    }

    public has<K extends keyof EnvSchema>(key: K): boolean {
        if (!this.env) {
            throw new BaseException('Environment variables not loaded. Call load() before accessing environment variables.')
        }

        return this.env![key] !== undefined
    }

    public get<K extends keyof EnvSchema>(key: K, defaultValue?: any): EnvSchema[K] {
        if (!this.env) {
            throw new BaseException('Environment variables not loaded. Call load() before accessing environment variables.')
        }

        return this.env![key] !== undefined ? this.env![key] : defaultValue
    }

    public set<K extends keyof EnvSchema>(key: K, value: EnvSchema[K]) {
        if (!this.env) {
            throw new BaseException('Environment variables not loaded. Call load() before accessing environment variables.')
        }

        this.env![key] = value
    }
}
