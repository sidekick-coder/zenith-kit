import { createLogger, defineConfig, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'
import prefixer from './vite/plugins/tailwindAutoPrefix.js'

export const logger = createLogger()

const externals = [
    'vue',
    /^vue\//,

    'vue-router',
    /^vue-router\//,

    'vee-validate',
    /^vee-validate\//,
    
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
    tsconfigPath: './tsconfig.client.json',
    staticImport: true,
}))


plugins.push(prefixer({
    prefix: 'zkit',
    include: ['**/*.vue', '**/*.ts', "**/*.css"],
    classes: {
        ignore: [".dark"]
    }
}))

plugins.push(tailwindcss())

export default defineConfig({
    customLogger: logger,
    plugins: plugins,
    build: {
        minify: process.env.NO_MINIFY ? false : true,
        rollupOptions: {
            external: externals,
        },
    },
})
