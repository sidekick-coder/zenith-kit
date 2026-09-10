#!/usr/bin/env node
import { CliWrapperService } from '../dist/server/index.mjs';
import { EnvService } from '../dist/server/index.mjs'
import { BaseException } from '../dist/shared/index.mjs'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import cp from 'node:child_process'

const cwd = process.cwd()

EnvService.dotEnvConfig({
    path: path.join(cwd, '.env'),
    quiet: true
})


let ZENITH_VERSION = 'v0.3.2'
let ZENITH_BASE_PATH = process.env.ZENITH_BASE_PATH
let ZENITH_KIT_DEBUG = process.env.ZENITH_KIT_DEBUG

const cacheDir = path.resolve(os.homedir(), '.zenith-kit', 'core', `${ZENITH_VERSION}`)

if (!ZENITH_BASE_PATH && !fs.existsSync(cacheDir)) {

    const stdio = ZENITH_KIT_DEBUG ? 'inherit' : 'ignore'
    const env = { ...process.env, NODE_ENV: 'development' }

    fs.mkdirSync(path.dirname(cacheDir), { recursive: true })

    console.log(`[kit] downloading core package v${ZENITH_VERSION} in ${cacheDir}...`)
    cp.execSync(`git clone --depth 1 --branch ${ZENITH_VERSION} https://github.com/sidekick-coder/zenith.git ${cacheDir}`, { stdio })

    console.log(`[kit] installing core dependencies...`)
    cp.execSync(`cd ${cacheDir} && npm install`, { stdio, env  })

    console.log(`[kit] building core...`)
    cp.execSync(`cd ${cacheDir} && npm run build`, { stdio, env })

    console.log(`[kit] core package ready, subsequent runs will be faster!`)
}

if (!ZENITH_BASE_PATH && fs.existsSync(cacheDir)) {
    console.log(`[kit] using cached zenith ${ZENITH_VERSION} from ${cacheDir}...`)
    ZENITH_BASE_PATH = cacheDir
}

if (!ZENITH_BASE_PATH) {
    throw new BaseException('An eror happened while trying to set the ZENITH_BASE_PATH environment variable. Please set it manually and try again.')
}

const wrapper = CliWrapperService
    .create()
    .setBasePath(ZENITH_BASE_PATH)

wrapper
    .addEnv('ZENITH_BASE_PATH', ZENITH_BASE_PATH)
    .addEnv('ZENITH_STORAGE_PATH', path.join(cwd, 'storage'))
    .addEnv('ZENITH_CONFIG_FS_PATH', path.join(cwd, 'config'))
    .addEnv('ZENITH_PLUGINS_DIR', cwd)
    .addEnv('ZENITH_COMMAND_DIR', path.resolve(import.meta.dirname, '../dist/server/commands'))
    .run()
