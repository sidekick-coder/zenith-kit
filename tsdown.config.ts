import { defineConfig, globalLogger } from 'tsdown'
import { generateIndexFile } from './src/server/utils/generateIndexFile.ts'
import zenith from './vite/plugins/zenith.js'

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
                        'src/shared/mixins',
                        'src/shared/entities',
                        'src/shared/loaders',
                    ],
                    filename: 'src/shared/index.ts'
                })

                globalLogger.info('Generated index.ts for shared')
            })
        }
    },
    {
        entry: [
            'src/server/index.ts',
            'src/server/commands/*'
        ],
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
                'vite',
                'tsdown',
                '@vitejs/plugin-vue',
                '@tailwindcss/vite'
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
                        'src/server/queries',
                        'src/server/relations',
                        'src/server/middlewares',
                        'src/server/utils',
                    ],
                    filename: 'src/server/index.ts'
                })

                globalLogger.info('Generated index.ts for server')
            })
        }
    },
    // {
    //     entry: 'src/client/index.ts',
    //     outDir: 'dist/client',
    //     dts: true,
    //     minify: true,
    //     sourcemap: 'inline',
    //     tsconfig: 'tsconfig.client.json',
    //     define: {
    //         'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    //         'import.meta.env.DEV': process.env.NODE_ENV === 'development' ? "true" : "false",
    //         'import.meta.env.PROD': process.env.NODE_ENV === 'production' ? "true" : "false",
    //     },
    //     // deps: {
    //     //     neverBundle: [
    //     //         'vue',
    //     //         'vue-router',
    //     //         '@unhead/vue',
    //     //     ]
    //     // },
    //     plugins: [
    //         zenith({
    //             imports: [
    //                 "vue",
    //                 // "@vueuse/core",
    //                 // "@unhead/vue",
    //                 // "vue-router",
    //                 // "vue-sooner",
    //                 // "vee-validate",
    //                 // "reka-ui",
    //             ]
    //         })
    //     ],
    //     hooks(hooks) {
    //         hooks.hook('build:before', async () => {
    //             generateIndexFile({
    //                 folders: [
    //                     'src/client/services',
    //                     'src/client/composables',
    //                     'src/client/repositories',
    //                     'src/client/mixins',
    //                     'src/client/facades',
    //                     'src/client/loaders',
    //                     'src/client/entities',
    //                     'src/client/utils',
    //                     'src/client/guards',
    //                     'src/client/registry',
    //                 ],
    //                 filename: 'src/client/index.ts'
    //             })
    //
    //             globalLogger.info('Generated index.ts for client')
    //         })
    //     }
    // },

])
