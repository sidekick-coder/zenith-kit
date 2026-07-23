import { createLogger, defineConfig, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'
import { generateIndexFile } from '#server/utils/generateIndexFile.ts'

const logger = createLogger()

const prebuild = () => ({
    name: 'prebuild',
    buildStart() {
        generateIndexFile({
            filename: 'src/client/components.ts',
            patterns: [
                'src/client/composables/*.ts',
                'src/client/components/ui/**/index.ts',
                'src/client/components/*.vue',
                'src/client/layouts/*.vue',
                'src/client/css/*.css',
            ]
        })

        logger.info('Generated index.ts for client')
    }
})

const externals = [
    'vue',
    'vue-router',
    'vee-validate',
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
    entryRoot: 'src/client/components.ts',
    tsconfigPath: './tsconfig.client.json',
    staticImport: true
}))

plugins.push(tailwindcss(), prebuild())

export default defineConfig({
    customLogger: logger,
    plugins: plugins,
    build: {
        outDir: 'dist/components',
        minify: false,
        rollupOptions: {
            external: externals,
        },
        lib: {
            name: 'Client',
            entry: 'src/client/components.ts',
            formats: ['es'],
            fileName: (format) => `index.${format}.js`,
            cssFileName: 'styles',
        },
    },
})
