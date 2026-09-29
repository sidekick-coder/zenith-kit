import { createLogger, defineConfig, mergeConfig } from 'vite'
import { generateIndexFile } from '#server/utils/generateIndexFile.ts'
import viteCommonConfig from './vite.common.config'

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

export default mergeConfig(viteCommonConfig, defineConfig({
    plugins: [prebuild()],
    build: {
        outDir: 'dist/client',
        lib: {
            name: 'Components',
            entry: 'src/client/index.ts',
            formats: ['es'],
            fileName: (format) => `index.${format}.js`,
            cssFileName: 'styles',
        },
    },
}))
