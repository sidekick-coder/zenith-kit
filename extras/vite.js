// @ts-check
import { createFilter } from '@rollup/pluginutils'
import MagicString from 'magic-string'
import * as acorn from 'acorn'

/**
 * @typedef {Object} Options
 * @property {string[]} [imports] - List of module names to replace with `globalThis.importAsync`
 * @property {string | string[]} [include] - Files to include (default: `**\/*.{js,ts,vue}`)
 * @property {string | string[]} [exclude] - Files to exclude (default: `node_modules/**`)
 */

/**
 * Vite plugin that replaces static and dynamic imports for specified modules
 * with `globalThis.importAsync(...)` calls at transform time.
 *
 * @param {Options} options
 * @returns {import('vite').Plugin}
 */
export default function (options) {
    const include = options.include || '**/*.{js,ts,vue}'
    const exclude = options.exclude || 'node_modules/**'
    const imports = options.imports || []

    const filter = createFilter(include, exclude)

    return {
        name: 'zenith',
        enforce: 'post',

        /**
         * @param {string} code
         * @param {string} id
         */
        transform(code, id) {
            if (!filter(id)) return null

            if (!code.includes('import')) return null

            const s = new MagicString(code)
            let hasChanges = false

            const ast = /** @type {any} */ (acorn.parse(code, {
                sourceType: 'module',
                ecmaVersion: 2022,
            }))

            const modulesFromList = imports

            /**
             * @param {string} importSource
             * @returns {boolean}
             */
            function shouldReplaceImport(importSource) {
                const isExternalModule = modulesFromList.includes(importSource)
                const isExternalModuleSubpath = modulesFromList.some(baseModule =>
                    importSource.startsWith(baseModule + '/') && importSource !== baseModule
                )

                return isExternalModule || isExternalModuleSubpath
            }

            /**
             * @param {any} node
             */
            function walkNode(node) {
                if (!node || typeof node !== 'object') return

                if (node.type === 'ImportExpression' && node.source?.value) {
                    const importSource = node.source.value

                    if (shouldReplaceImport(importSource)) {
                        const replacement = `globalThis.importAsync("${importSource}")`
                        s.overwrite(node.start, node.end, replacement)
                        hasChanges = true
                    }
                }

                for (const key in node) {
                    if (key === 'start' || key === 'end' || key === 'type') continue
                    const child = node[key]
                    if (Array.isArray(child)) {
                        child.forEach(walkNode)
                    } else {
                        walkNode(child)
                    }
                }
            }

            walkNode(ast)

            const importNodes = ast.body.filter((/** @type {any} */ node) => node.type === 'ImportDeclaration').reverse()

            for (const node of importNodes) {
                const importSource = node.source.value

                if (shouldReplaceImport(importSource)) {
                    if (node.specifiers.length === 0) {
                        const replacement = `await globalThis.importAsync("${importSource}");`
                        s.overwrite(node.start, node.end, replacement)
                        hasChanges = true
                    } else {
                        const replacements = node.specifiers
                            .map((/** @type {any} */ spec) => {
                                const localName = spec.local.name
                                let replacement = ''

                                if (spec.type === 'ImportSpecifier') {
                                    const importedName = spec.imported.name
                                    replacement = `const { ${importedName}: ${localName} } = await globalThis.importAsync("${importSource}");`
                                }

                                if (spec.type === 'ImportDefaultSpecifier') {
                                    const moduleVarName = `__module__${localName}__`
                                    replacement = `const ${moduleVarName} = await globalThis.importAsync("${importSource}"); const ${localName} = ${moduleVarName}.default || ${moduleVarName};`
                                }

                                if (spec.type === 'ImportNamespaceSpecifier') {
                                    replacement = `const ${localName} = await globalThis.importAsync("${importSource}");`
                                }

                                return replacement
                            })
                            .filter(Boolean)
                            .join('\n')

                        if (replacements) {
                            s.overwrite(node.start, node.end, replacements)
                            hasChanges = true
                        }
                    }
                }
            }

            if (!hasChanges) return null

            return {
                code: s.toString(),
                map: s.generateMap({ hires: true }),
            }
        },
    }
}
