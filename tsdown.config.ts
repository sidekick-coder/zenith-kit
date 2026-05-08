import { defineConfig, globalLogger } from 'tsdown'
import { generateIndexFile } from './src/server/utils/generateIndexFile'

export default defineConfig([
    {
        entry: 'src/shared/index.ts',
        outDir: 'dist/shared',
        tsconfig: 'tsconfig.shared.json',
        dts: true,
        minify: true,
        sourcemap: 'inline',
        hooks(hooks) {
            hooks.hook('build:before', async () => {
                generateIndexFile({
                    folders: [
                        'src/shared/services',
                        'src/shared/utils',
                        'src/shared/schemas',
                        'src/shared/exceptions',
                        'src/shared/facades',
                        'src/shared/entities',
                    ],
                    filename: 'src/shared/index.ts'
                })

                globalLogger.info('Generated index.ts for shared')
            })
        }
    },
    {
        entry: 'src/server/index.ts',
        outDir: 'dist/server',
        dts: true,
        minify: true,
        sourcemap: 'inline',
        tsconfig: 'tsconfig.server.json',
        deps: {
            neverBundle: [
                'express',
                'kysely',
                'chalk',
                'commander',
                '@unhead/vue',
            ]
        },
        hooks(hooks) {
            hooks.hook('build:before', async () => {
                generateIndexFile({
                    folders: [
                        'src/server/services',
                        'src/server/repositories',
                        'src/server/gateways',
                        'src/server/mixins',
                        'src/server/facades',
                        'src/server/contracts',
                        'src/server/loaders',
                        'src/server/entities',
                        'src/server/utils',
                    ],
                    filename: 'src/server/index.ts'
                })

                globalLogger.info('Generated index.ts for server')
            })
        }
    },
    {
        entry: 'src/client/index.ts',
        outDir: 'dist/client',
        dts: true,
        minify: true,
        sourcemap: 'inline',
        tsconfig: 'tsconfig.client.json',
        deps: {
            neverBundle: [
                'vue',
                'vue-router',
                '@unhead/vue',
            ]
        },
        hooks(hooks) {
            hooks.hook('build:before', async () => {
                generateIndexFile({
                    folders: [
                        'src/client/services',
                        'src/client/repositories',
                        'src/client/mixins',
                        'src/client/facades',
                        'src/client/loaders',
                        'src/client/entities',
                        'src/client/utils',
                        'src/client/guards',
                    ],
                    filename: 'src/client/index.ts'
                })

                globalLogger.info('Generated index.ts for client')
            })
        }
    },

])
