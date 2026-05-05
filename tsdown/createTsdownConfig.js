import { defineConfig } from 'tsdown'
import path from 'path'

/**
 * @typedef {Object} Options
 * @property {string} [entry] - Entry file or directory (default: `src/server/index.ts`)
 * @property {string} [outDir] - Output directory (default: `dist/server`)
 */

/**
 * Vite plugin that replaces static and dynamic imports for specified modules
 * with `globalThis.importAsync(...)` calls at transform time.
 *
 * @param {Options} options
 */
export default function (options) {
    const tsConfigPath = path.resolve(import.meta.dirname, '..', 'tsconfig.server.json')

    return defineConfig({
        entry: options.entry,
        outDir: options.outDir,
        tsconfig: tsConfigPath,
        minify: true,
    })

}
