import { defineConfig, mergeConfig } from 'vite'
import { generateIndexFile } from '#server/utils/generateIndexFile.ts'
import viteCommonConfig, { logger } from './vite.common.config'


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
                'src/client/css/styles.css',
            ]
        })

        logger.info('Generated components.ts for components')
    }
})

export default mergeConfig(viteCommonConfig, defineConfig({
    plugins: [prebuild()],
    build: {
        outDir: 'dist/components',
        lib: {
            name: 'Components',
            entry: 'src/client/components.ts',
            formats: ['es'],
            fileName: (format) => `index.${format}.js`,
            cssFileName: 'styles',
        },
    },
}))
