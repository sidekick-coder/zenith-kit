#!/usr/bin/env node
import { CliWrapperService } from '../dist/server/index.mjs';
import { EnvService } from '../dist/server/index.mjs'
import { BaseException } from '../dist/shared/index.mjs'
import path from 'node:path'

const cwd = process.cwd()

EnvService.dotEnvConfig({
    path: path.join(cwd, '.env'),
    quiet: true
})

if (!process.env.ZENITH_BASE_PATH) {
    throw new BaseException('ZENITH_BASE_PATH environment variable is not set. Please set it to the base path of your project.')
}

const wrapper = CliWrapperService
    .create()
    .setBasePath(process.env.ZENITH_BASE_PATH)

wrapper
    .addEnv('ZENITH_BASE_PATH', process.env.ZENITH_BASE_PATH)
    .addEnv('ZENITH_STORAGE_PATH', path.join(cwd, 'storage'))
    .addEnv('ZENITH_CONFIG_FS_PATH', path.join(cwd, 'config'))
    .addEnv('ZENITH_PLUGINS_DIR', cwd)
    .addEnv('ZENITH_COMMAND_DIR', path.resolve(import.meta.dirname, '../dist/server/commands'))
    .run()
