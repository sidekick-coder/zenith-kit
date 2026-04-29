import * as v from 'valibot'
import { set } from 'lodash-es'

export type EnvSchema = v.InferOutput<typeof envSchema>

const boolean = v.pipe(
    v.union([v.literal('true'), v.literal('false'), v.literal('1'), v.literal('0')]),
    v.transform((value) => value === 'true' || value === '1'),
    v.boolean()
)

const config = v.optional(v.pipe(v.string(), v.transform((value) => {
    const entries = value.split(/[;\n]/)
        .filter(Boolean)
        .filter(l => l.includes('='))
        .map(l => l.trim().split('='))

    const obj = Object.fromEntries(entries) as Record<string, string>

    const result: Record<string, any> = {}

    for (const [key, value] of Object.entries(obj)) {
        let parsedValue: any = value

        if (value.startsWith('bool:')) {
            parsedValue = value.replace('bool:', '').trim() === 'true'
        }

        set(result, key, parsedValue)
    }

    return result
})))

const stringArray = v.pipe(
    v.string(),
    v.transform((value) => value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    )
)

export const envSchema = v.object({
    NODE_ENV: v.optional(v.union([v.literal('development'), v.literal('production'), v.literal('test')]), 'development'),

    ZENITH_BASE_PATH: v.string(),

    ZENITH_APP_URL: v.optional(v.string(), 'http://localhost:3000'),
    ZENITH_PORT: v.optional(v.pipe(v.string(), v.transform((value) => parseInt(value))), '3000'),
    ZENITH_HOST: v.optional(v.string(), '0.0.0.0'),

    ZENITH_LOG_LEVEL: v.optional(v.picklist(['error', 'warn', 'info', 'debug']), 'info'),
    ZENITH_LIFECYCLE_DEBUG: v.optional(boolean, 'false'),
    ZENITH_CLIENT_CONFIG: config,
    
    ZENITH_CONFIG: config,
    ZENITH_CONFIG_ARGUMENTS: config,
    ZENITH_CONFIG_FILES: v.optional(stringArray, ''),

    ZENITH_CONFIG_DEBUG: v.optional(boolean, 'false'),
    ZENITH_CONFIG_DRIVER: v.optional(v.picklist(['fs', 's3']), 'fs'),
    ZENITH_CONFIG_FS_PATH: v.optional(v.string()),
    ZENITH_CONFIG_S3_BUCKET: v.optional(v.string()),
    ZENITH_CONFIG_S3_REGION: v.optional(v.string()),
    ZENITH_CONFIG_S3_ACCESS_KEY_ID: v.optional(v.string()),
    ZENITH_CONFIG_S3_SECRET_ACCESS_KEY: v.optional(v.string()),
    ZENITH_CONFIG_S3_SESSION_TOKEN: v.optional(v.string()),
    ZENITH_CONFIG_S3_ENDPOINT: v.optional(v.string()),
    ZENITH_CONFIG_S3_PREFIX: v.optional(v.string(), ''),


    ZENITH_MODULE_EXTRAS: v.optional(stringArray, ''),
})
