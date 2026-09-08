import { defineConfig, type UserConfig } from 'tsdown'
import path from 'path'

export interface CreateTsdownConfigOptions {
    root?: string
    entry?: UserConfig['entry']
    outDir?: string
}

export function createTsDownConfig(options: CreateTsdownConfigOptions) {
    const tsConfigPath = path.resolve(import.meta.dirname, '..', '..', '..', 'tsconfig.server.json')

    return defineConfig({
        root: options.root || process.cwd(),
        entry: options.entry,
        outDir: options.outDir || 'dist/server',
        tsconfig: tsConfigPath,
        minify: true,
        unbundle: true,
    })

}
