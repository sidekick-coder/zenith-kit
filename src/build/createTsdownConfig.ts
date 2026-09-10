import { defineConfig, type UserConfig } from 'tsdown'

export interface CreateTsdownConfigOptions {
    root?: string
    entry?: UserConfig['entry']
    tsConfigPath?: string
    outDir?: string
}

export function createTsDownConfig(options: CreateTsdownConfigOptions) {
    return defineConfig({
        root: options.root || process.cwd(),
        entry: options.entry,
        outDir: options.outDir || 'dist/server',
        tsconfig: options.tsConfigPath,
        minify: true,
        unbundle: true,
    })

}
