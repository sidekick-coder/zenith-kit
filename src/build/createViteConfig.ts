import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export interface CreateViteConfigOptions {
    entry: string
    name?: string
    outDir?: string
    env?: Record<string, any>
    ssr?: boolean
}

export function createViteConfig(options: CreateViteConfigOptions) {
    return defineConfig({
        define: {
            'process.env': options.env || {}
        },
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
        ],
        build: {
            outDir: options.outDir,
            minify: true,
            manifest: true,
            ssr: options.ssr || false,
            ssrManifest: options.ssr || false,
            rollupOptions: {
                external: [
                    'vue',
                    'vue-router',
                    'vee-validate',
                ],
            },
            lib: {
                name: options.name,
                entry: options.entry,
                formats: ['es'],
            },
        },
    })
}

