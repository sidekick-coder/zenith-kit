import { defineConfig, globalLogger } from 'tsdown'
import { generateIndexFile } from './src/server/utils/generateIndexFile'

export default defineConfig([
    {
        entry: 'src/shared/index.ts',
        outDir: 'dist/shared',
        tsconfig: 'tsconfig.shared.json',
        hooks(hooks) {
            hooks.hook('build:before', async () => {
                generateIndexFile({
                    folders: [
                        'src/shared/services', 
                        'src/shared/utils',
                        'src/shared/schemas',
                        'src/shared/exceptions',
                        'src/shared/facades',
                        'src/shared/entities',
                    ],
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
                    folders: [
                        'src/server/services',
                        'src/server/repositories',
                        'src/server/gateways',
                        'src/server/mixins',
                        'src/server/facades',
                        'src/server/contracts',
                        'src/server/loaders',
                        'src/server/entities',
                        'src/server/utils',
                    ],
                    filename: 'src/server/index.ts'
                })

                globalLogger.info('Generated index.ts for server')
            })
        }
    }
])
