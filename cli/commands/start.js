import { Command } from 'commander'
import createWrapper from '../utils/createWrapper.js'
import { EnvService } from '../../dist/server/index.mjs'
import { BaseException } from '../../dist/shared/index.mjs'
import path from 'node:path'
import config from '../config.js'

const command = new Command('start')

command
    .description('Start product server')
    .action(async () => {
        const cwd = process.cwd()
        const id = config.module_id || path.basename(cwd)

        EnvService.dotEnvConfig({
            path: path.join(cwd, '.env'),
            quiet: true
        })

        if (!process.env.ZKIT_ZENITH_BASE_PATH) {
            throw new BaseException('ZKIT_ZENITH_BASE_PATH environment variable is not set. Please set it to the base path of your project.')
        }

        const wrapper = createWrapper({
            zenithDirectory: process.env.ZKIT_ZENITH_BASE_PATH
        })

        wrapper
            .addEnv('ZENITH_BASE_PATH', process.env.ZKIT_ZENITH_BASE_PATH)
            .addEnv('ZENITH_CONFIG_FS_PATH', path.join(cwd, 'config'))
            .addEnv('ZENITH_PLUGINS', `${id}.directory=${cwd}`)
            .run(['serve'])
    })

export default command


