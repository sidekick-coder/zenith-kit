import { defineConfig } from 'tsdown'
import path from 'path'

/**
 * @typedef {Object} Options
 * @property {import('tsdown').UserConfig['root']} [root] - Root directory (default: current working directory)
 * @property {import('tsdown').UserConfig['entry']} [entry] - Entry file or directory (default: `src/server/index.ts`)
 * @property {string} [outDir] - Output directory (default: `dist/server`)
 */

/**
 * Vite plugin that replaces static and dynamic imports for specified modules
 * with `globalThis.importAsync(...)` calls at transform time.
 *
 * @param {Options} options
 */
export default function(options) {
    const tsConfigPath = path.resolve(import.meta.dirname, '..', 'tsconfig.server.json')

    return defineConfig({
        root: options.root || process.cwd(),
        entry: options.entry,
        outDir: options.outDir || 'dist/server',
        tsconfig: tsConfigPath,
        minify: true,
        unbundle: true,
    })

}
