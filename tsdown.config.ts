import { defineConfig, globalLogger } from 'tsdown'
import { generateIndexFile } from './src/shared/utils/generateIndexFile'

export default defineConfig([
    {
        entry: 'src/shared/index.ts',
        outDir: 'dist/shared',
        tsconfig: 'tsconfig.shared.json',
        hooks(hooks) {
            hooks.hook('build:before', async () => {
                generateIndexFile({
                    folders: ['src/shared/services', 'src/shared/utils'],
                    filename: 'src/shared/index.ts'
                })

                globalLogger.info('Generated index.ts for shared')
            })
        }
    },
    {
        entry: 'src/server/index.ts',
        outDir: 'dist/server',
        tsconfig: 'tsconfig.server.json',
        hooks(hooks) {
            hooks.hook('build:before', async () => {
                generateIndexFile({
                    folders: ['src/server/services'],
                    filename: 'src/server/index.ts'
                })

                globalLogger.info('Generated index.ts for server')
            })
        }
    }
])
