import { defineConfig } from 'tsdown'

export default defineConfig([
    {
        entry: 'src/shared/index.ts',
        outDir: 'dist/shared',
        tsconfig: 'tsconfig.shared.json',
    },
    {
        entry: 'src/server/index.ts',
        outDir: 'dist/server',
        tsconfig: 'tsconfig.server.json',
    }
])
