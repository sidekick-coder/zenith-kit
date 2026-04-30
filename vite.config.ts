import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
    plugins: [vue(), tailwindcss()],
    build: {
        lib: {
            entry: ['src/client/index.ts'],
            fileName: (format, entryName) => `client-${entryName}.${format}.js`,
            cssFileName: 'styles.css',
        },
    },
})
