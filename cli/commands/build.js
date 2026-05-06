import { Command } from 'commander'
import * as tsdown from 'tsdown'
import * as vite from 'vite'
import path from 'path'
import createTsdownConfig from '../../tsdown/createTsdownConfig.js'
import createViteConfig from '../../vite/createViteConfig.js'
import config from '../config.js'

const command = new Command('build')

command
    .description('Build plugin for production')
    .action(async () => {
        const cwd = process.cwd()

        const entry = {
            index: 'src/server/index.ts',
        }

        if (config?.build?.server?.entries) {
            Object.assign(entry, config.build.server.entries)
        }

        const tsdownConfig = createTsdownConfig({
            root: cwd,
            entry: entry,
        })

        await tsdown.build(tsdownConfig)

        const viteNodeConfig = createViteConfig({
            entry: path.resolve(cwd, 'src/client/index.ts'),
            outDir: path.resolve(cwd, 'dist/client-node'),
            ssr: true
        })

        await vite.build(viteNodeConfig)

        const viteBrowserConfig = createViteConfig({
            entry: path.resolve(cwd, 'src/client/index.ts'),
            outDir: path.resolve(cwd, 'dist/client-browser'),
            ssr: false
        })

        await vite.build(viteBrowserConfig)
    })

export default command

