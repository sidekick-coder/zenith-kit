import { createLogger, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { generateIndexFile } from '#server/utils/generateIndexFile.ts'

const logger = createLogger()

const prebuild = () => ({
    name: 'prebuild',
    buildStart() {
        generateIndexFile({
            glob: '**/*.{ts,vue,css}',
            folders: [
                'src/client/composables',
                // 'src/client/utils',
                // 'src/client/facades',
                'src/client/components',
                'src/client/layouts',
                // 'src/client/services',
                // 'src/client/guards',
                'src/client/css',
            ],
            filename: 'src/client/components.ts'
        })

        logger.info('Generated index.ts for client')
    }
})

const externals = [
    'vue',
    'vue-router',
    'vee-validate',
]

export default defineConfig({
    customLogger: logger,
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => {
                        return ['iconify-icon'].includes(tag)
                    }
                }
            }
        }),
        // dts({
        //     entryRoot: 'src/client/index.ts',
        //     tsconfigPath: 'tsconfig.client.json',
        //     bundleTypes: true,
        // }),
        tailwindcss(),
        prebuild(),
    ],
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
