import { createLogger, defineConfig, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'
import { generateIndexFile } from '#server/utils/generateIndexFile.ts'
import zenith from './vite/plugins/zenith'

const logger = createLogger()

const prebuild = () => ({
    name: 'prebuild',
    buildStart() {
        generateIndexFile({
            filename: 'src/client/index.ts',
            folders: [
                'src/client/services',
                'src/client/composables',
                'src/client/repositories',
                'src/client/mixins',
                'src/client/facades',
                'src/client/loaders',
                'src/client/entities',
                'src/client/utils',
                'src/client/guards',
                'src/client/registry',
            ]
        })

        logger.info('Generated index.ts for client')
    }
})

const externals = [
    'vue',
    // 'vue-router',
    // '@vueuse/core',
    // '@vueuse/router',
    // 'vee-validate',
    // '@vee-validate/valibot',
    // "@unhead/vue",
    // "vue-router",
    // "vue-sonner",
    // "vee-validate",
    // "reka-ui",
]

const plugins: UserConfig['plugins'] = [
    vue({
        template: {
            compilerOptions: {
                isCustomElement: (tag) => {
                    return ['iconify-icon'].includes(tag)
                }
            }
        }
    }),
]

plugins.push(dts({
    // entryRoot: 'src/client/index.ts',
    tsconfigPath: './tsconfig.client.json',
    staticImport: true,
}))

plugins.push(tailwindcss(), prebuild())

// plugins.push(zenith({
//     imports: externals
// }))

export default defineConfig({
    customLogger: logger,
    plugins: plugins,
    build: {
        outDir: 'dist/client',
        rollupOptions: {
            external: externals,
        },
        lib: {
            name: 'Client',
            entry: 'src/client/index.ts',
            formats: ['es'],
            fileName: (format) => `index.${format}.js`,
            cssFileName: 'styles',
        },
    },
})
