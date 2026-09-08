import * as tsdown from 'tsdown'
import * as vite from 'vite'
import path from 'path'
import { CliCommand } from '#server/services/CliService.js'
import { createTsDownConfig } from '#build/createTsdownConfig.js'
import { createViteConfig } from '#build/createViteConfig.js'
import { getPluginConfig } from '#server/utils/config.js'

const command = new CliCommand('plugin:build')

command
    .helpGroup('plugins')
    .description('Build plugin for production')
    .action(async () => {
        const cwd = process.cwd()

        const config = getPluginConfig(cwd)


        const entry = {
            index: 'src/server/index.ts',
        }

        if (config?.build?.server?.entries) {
            Object.assign(entry, config.build.server.entries)
        }

        const tsdownConfig = createTsDownConfig({
            root: cwd,
            entry: entry,
        })


        await tsdown.build(tsdownConfig)

        const viteNodeConfig = createViteConfig({
            entry: path.resolve(cwd, 'src/client/index.ts'),
            outDir: path.resolve(cwd, 'dist/client-node'),
            ssr: true,
            env: {
                NODE_ENV: 'production'
            }
        })

        await vite.build(viteNodeConfig)

        const viteBrowserConfig = createViteConfig({
            entry: path.resolve(cwd, 'src/client/index.ts'),
            outDir: path.resolve(cwd, 'dist/client-browser'),
            ssr: false,
            env: {
                NODE_ENV: 'production'
            }
        })

        await vite.build(viteBrowserConfig)
    })

export default command

