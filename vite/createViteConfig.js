import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import zenith from './plugins/zenith.js'


/**
 * @typedef {Object} Options
 * @property {string} [name] - Library name (default: `server`)
 * @property {string} [entry] - Entry file or directory (default: `src/server/index.ts`)
 * @property {string} [outDir] - Output directory (default: `dist/server`)
 * @property {boolean} [ssr] - Whether to build for SSR (default: `false`). If `true`, external dependencies will be treated as CommonJS modules. If `false`, they will be treated as ES modules.
 */

/**
 * Vite plugin that replaces static and dynamic imports for specified modules
 * with `globalThis.importAsync(...)` calls at transform time.
 *
 * @param {Options} options
 */
export default function(options) {
    return defineConfig({
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
            zenith({
                imports: [
                    'vue',
                    'vue-router',
                ],
            })
        ],
        build: {
            outDir: options.outDir,
            minify: true,
            manifest: true,
            ssr: options.ssr || false,
            ssrManifest: options.ssr || false,
            lib: {
                name: options.name,
                entry: options.entry,
                formats: ['es'],
            },
        },
    })
}

