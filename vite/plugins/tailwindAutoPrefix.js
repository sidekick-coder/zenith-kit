// @ts-check
import { createFilter } from '@rollup/pluginutils'
import MagicString from 'magic-string'
import * as acorn from 'acorn'
import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'

/**
 * @typedef {Object} Options
 * @property {string} prefix - Prefix prepended to every Tailwind class found (Tailwind v4 variant-style prefix, e.g. `tw` -> `tw:flex`, `tw:hover:flex`)
 * @property {string | string[]} [include] - Files to include (default: `**\/*.{vue,html,js,jsx,ts,tsx}`)
 * @property {string | string[]} [exclude] - Files to exclude (default: `node_modules/**`)
 */

/**
 * Matches `class`, `className`, `:class` and `v-bind:class` attributes and
 * captures the quote character used and the raw attribute value.
 */
const CLASS_ATTR_REGEX = /(?:^|\s)(?:class|className|:class|v-bind:class)\s*=\s*(?<quote>["'])(?<value>.*?)\k<quote>/gs

/**
 * Binary operators that compare a value for equality; string literals used
 * as an operand of these must never be treated as class names, since they
 * are being compared against a variable (e.g. `side === 'left'`), not
 * rendered as a class.
 */
const EQUALITY_OPERATORS = new Set(['===', '!==', '==', '!='])

/**
 * @param {string} className
 * @param {string} prefix
 */
function prefixClassName(className, prefix) {
    if (!className || className.startsWith(`${prefix}:`)) {
        return className
    }

    return `${prefix}:${className}`
}

/**
 * @param {string} value
 * @param {string} prefix
 */
function prefixClassList(value, prefix) {
    return value
        .split(/(\s+)/) // split keeping whitespace so original formatting is preserved
        .map(token => (token.trim() ? prefixClassName(token, prefix) : token))
        .join('')
}

/**
 * @param {any} node
 * @param {any} parent
 */
function isComparisonOperand(node, parent) {
    return !!parent
        && parent.type === 'BinaryExpression'
        && EQUALITY_OPERATORS.has(parent.operator)
        && (parent.left === node || parent.right === node)
}

/**
 * Prefixes only the string literals that are actually rendered as class
 * names inside a dynamic `:class`/`v-bind:class` JS expression, leaving
 * string literals used as comparison operands untouched
 * (e.g. `side === 'left' ? 'left-0' : 'right-0'` only prefixes `'left-0'`
 * and `'right-0'`, never the `'left'` being compared against `side`).
 *
 * Falls back to returning the original value untouched if the expression
 * cannot be parsed as JavaScript.
 *
 * @param {string} value
 * @param {string} prefix
 */
function prefixDynamicClassValue(value, prefix) {
    const wrapped = `(${value})`

    let ast

    try {
        ast = acorn.parseExpressionAt(wrapped, 0, { ecmaVersion: 'latest' })
    } catch {
        return value
    }

    const s = new MagicString(wrapped)
    let hasChanges = false

    /**
     * @param {any} node
     * @param {any} parent
     */
    function walk(node, parent) {
        if (!node || typeof node !== 'object' || typeof node.type !== 'string') return

        const isStringLiteral = node.type === 'Literal' && typeof node.value === 'string'

        if (isStringLiteral && !isComparisonOperand(node, parent)) {
            const quote = node.raw?.[0] === "'" ? "'" : '"'
            const newValue = prefixClassList(node.value, prefix)

            if (newValue !== node.value) {
                s.overwrite(node.start, node.end, `${quote}${newValue}${quote}`)
                hasChanges = true
            }
        }

        // don't descend into a string literal node, there is nothing left to walk
        if (isStringLiteral) return

        for (const key in node) {
            if (key === 'start' || key === 'end' || key === 'type') continue
            const child = node[key]

            if (Array.isArray(child)) {
                child.forEach(item => walk(item, node))
            } else {
                walk(child, node)
            }
        }
    }

    walk(ast, null)

    if (!hasChanges) return value

    return s.toString().slice(1, -1)
}

/**
 * Rewrites every class selector in the given CSS so it targets the prefixed
 * classes emitted by `prefixClassList`, e.g. `.flex` -> `.zkit\:flex` and
 * `.hover\:flex:hover` -> `.zkit\:hover\:flex:hover`.
 *
 * This is required because Tailwind's own class scanner reads the original
 * (unprefixed) source files directly from disk, so it always generates
 * unprefixed utility CSS regardless of what this plugin does to the JS/Vue
 * output. Prefixing the generated CSS selectors keeps them in sync with the
 * classes emitted at runtime.
 *
 * @param {string} css
 * @param {string} prefix
 */
function prefixCss(css, prefix) {
    const root = postcss.parse(css)

    const transform = selectorParser(selectors => {
        selectors.walkClasses(classNode => {
            if (classNode.value.startsWith(`${prefix}:`)) return

            classNode.value = `${prefix}:${classNode.value}`
        })
    })

    root.walkRules(rule => {
        rule.selector = transform.processSync(rule.selector)
    })

    return root.toString()
}

/**
 * Vite plugin that scans included files for Tailwind CSS classes (`class`,
 * `className`, `:class`, `v-bind:class`) and prepends a fixed prefix to each
 * class found, following Tailwind v4's variant-style prefix syntax
 * (e.g. `flex` -> `tw:flex`, `hover:flex` -> `tw:hover:flex`).
 *
 * @param {Options} options
 * @returns {import('vite').Plugin[]}
 */
export default function(options) {
    const prefix = options?.prefix

    if (!prefix) {
        throw new Error('[tailwindAutoPrefix] "prefix" option is required')
    }

    const include = options?.include || '**/*.{vue,html,js,jsx,ts,tsx}'
    const exclude = options?.exclude || 'node_modules/**'

    const filter = createFilter(include, exclude)

    const sourcePlugin = {
        name: 'tailwind-auto-prefix',
        enforce: /** @type {const} */ ('pre'),

        /**
         * @param {string} code
         * @param {string} id
         */
        transform(code, id) {
            if (!filter(id)) {
                return null
            }

            const s = new MagicString(code)
            let hasChanges = false

            CLASS_ATTR_REGEX.lastIndex = 0

            let match

            while ((match = CLASS_ATTR_REGEX.exec(code))) {
                const fullMatch = match[0]
                const { quote, value } = /** @type {{ quote: string, value: string }} */ (match.groups)

                const quotedValue = `${quote}${value}${quote}`
                const relativeIndex = fullMatch.lastIndexOf(quotedValue)
                const valueStart = match.index + relativeIndex + 1
                const valueEnd = valueStart + value.length

                const isDynamicBinding = /^\s*(?::class|v-bind:class)\s*=/.test(fullMatch)

                let newValue

                if (isDynamicBinding) {
                    newValue = prefixDynamicClassValue(value, prefix)
                } else {
                    newValue = prefixClassList(value, prefix)
                }

                if (newValue !== value) {
                    s.overwrite(valueStart, valueEnd, newValue)
                    hasChanges = true
                }
            }

            if (!hasChanges) return null

            return {
                code: s.toString(),
                map: s.generateMap({ hires: true }),
            }
        },
    }

    const cssPlugin = {
        name: 'tailwind-auto-prefix:css',
        enforce: /** @type {const} */ ('post'),

        /**
         * @param {*} _options
         * @param {Record<string, import('vite').Rollup.OutputAsset | import('vite').Rollup.OutputChunk>} bundle
         */
        generateBundle(_options, bundle) {
            for (const fileName of Object.keys(bundle)) {
                const chunk = bundle[fileName]

                if (chunk.type !== 'asset' || !fileName.endsWith('.css') || typeof chunk.source !== 'string') {
                    continue
                }

                chunk.source = prefixCss(chunk.source, prefix)
            }
        },
    }

    return [sourcePlugin, cssPlugin]
}
