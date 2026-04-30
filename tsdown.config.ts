import { defineConfig, globalLogger } from 'tsdown'
import { generateIndexFile } from './src/server/utils/generateIndexFile'

export default defineConfig([
    {
        entry: 'src/shared/index.ts',
        outDir: 'dist/shared',
        tsconfig: 'tsconfig.shared.json',
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
        tsconfig: 'tsconfig.server.json',
        deps: {
            neverBundle: [
                'express',
                'kysely',
                'chalk',
                'commander',
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
        tsconfig: 'tsconfig.client.json',
        fromVite: true,
        deps: {
            neverBundle: [
                'vue',
                'vue-router',
                'axios',
                '@vueuse/core',
                '@vueuse/head',
                '@vueuse/integrations',
                '@vueuse/nuxt',
            ]
        },
        hooks(hooks) {
            hooks.hook('build:before', async () => {
                generateIndexFile({
                    glob: '**/*.{ts,vue}',
                    folders: [
                        'src/client/services',
                        'src/client/facades',
                        'src/client/entities',
                        'src/client/guards',
                        'src/client/components',
                        'src/client/layouts',
                    ],
                    filename: 'src/client/index.ts'
                })

                globalLogger.info('Generated index.ts for client')
            })
        }
    }
])
