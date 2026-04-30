import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: ['src/client/index.ts'],
            fileName: (format, entryName) => `client-${entryName}.${format}.js`,
            cssFileName: 'styles.css',
        },
    },
})
