import { defineConfig, type UserConfig, globalLogger } from 'tsdown'
import { generateIndexFile } from './src/server/utils/generateIndexFile.ts'

const configs = [] as UserConfig[]

const sharedFolders = [
    'src/shared/services',
    'src/shared/utils',
    'src/shared/schemas',
    'src/shared/exceptions',
    'src/shared/facades',
    'src/shared/mixins',
    'src/shared/entities',
    'src/shared/loaders',
]

configs.push({
    entry: [
        'src/shared/index.ts',
        '!src/shared/**/*.test.ts',
        ...sharedFolders.map(folder => `${folder}/*`),
    ],
    outDir: 'dist/shared',
    tsconfig: 'tsconfig.shared.json',
    dts: true,
    minify: true,
    sourcemap: 'inline',
    treeshake: true,
    // deps: {
    //     neverBundle: [
    //         'valibot',
    //         'lodash-es'
    //     ]
    // },
    hooks(hooks) {
        hooks.hook('build:before', async () => {
            generateIndexFile({
                folders: sharedFolders,
                filename: 'src/shared/index.ts'
            })

            globalLogger.info('Generated index.ts for shared')
        })
    }
})

const serverFolders = [
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
]

configs.push({
    entry: [
        'src/server/index.ts',
        '!src/server/**/*.test.ts',
        'src/server/commands/*',
        ...serverFolders.map(folder => `${folder}/*`),
    ],
    outDir: 'dist/server',
    dts: true,
    minify: true,
    treeshake: true,
    sourcemap: 'inline',
    tsconfig: 'tsconfig.server.json',
    deps: {
        neverBundle: [
            // 'valibot',
            // 'lodash-es',
            'express',
            'kysely',
            'chalk',
            'commander',
            '@unhead/vue',
            'vite',
            'tsdown',
            '@vitejs/plugin-vue',
            '@tailwindcss/vite',
            '@aws-sdk/client-s3',
        ]
    },
    hooks(hooks) {
        hooks.hook('build:before', async () => {
            generateIndexFile({
                folders: serverFolders,
                filename: 'src/server/index.ts'
            })

            globalLogger.info('Generated index.ts for server')
        })
    }
})

export default defineConfig(configs)
// export default defineConfig([
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

