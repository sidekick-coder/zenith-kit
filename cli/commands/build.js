import { Command } from 'commander'
import { build } from 'tsdown'
import createServerTsDownConfig from '../../extras/tsdown.js'
import path from 'path'

const command = new Command('build')

command
    .description('Build plugin for production')
    .action(async () => {
        const cwd = process.cwd()

        const config = createServerTsDownConfig({
            entry: path.resolve(cwd, 'src/server/index.ts'),
            outDir: path.resolve(cwd, 'dist/server'),
        })

        await build(config)
    })

export default command

