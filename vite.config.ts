import { createLogger, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { importReplacer } from './src/build/vite'
import { generateIndexFile } from '#server/utils/generateIndexFile.ts'

const logger = createLogger()

const prebuild = () => ({
    name: 'prebuild',
    buildStart() {
        generateIndexFile({
            glob: '**/*.{ts,vue}',
            folders: [
                // 'src/client/composables',
                'src/client/utils',
                'src/client/facades',
                // 'src/client/components',
                'src/client/layouts',
                'src/client/services',
                'src/client/guards',
            ],
            filename: 'src/client/index.ts'
        })

        logger.info('Generated index.ts for client')
    }
})

const externals = [
    'vue',
    'vue-router',
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
        tailwindcss(),
        prebuild(),
        // importReplacer({
        //     imports: [
        //         'vue',
        //         'vue-router',
        //         'vue-sonner',
        //         'vee-validate',
        //         'reka-ui',
        //         '@vueuse/core',
        //         '@unhead/vue',
        //     ],
        // })
    ],
    build: {
        outDir: 'dist/client',
        minify: false,
        rollupOptions: {
            external: externals,
        },
        lib: {
            name: 'Client',
            entry: 'src/client/index.ts',
            formats: ['es'],
            fileName: (format) => `index.${format}.js`,
            cssFileName: 'styles.css',
        },
    },
})
