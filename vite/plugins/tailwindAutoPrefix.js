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
 * @property {string[]} [excludeVars] - CSS custom property (variable) names to leave untouched, e.g. `--reka-*`. Supports `*` wildcards. By default every custom property is prefixed.
 * @property {{ ignore?: string[] }} [classes] - `classes.ignore` lists literal class names (e.g. `.dark`) that must never receive the prefix, even when found as a standalone class. Compound/variant classes that merely contain the name (e.g. `dark:bg-input`) are still prefixed as usual.
 */

/**
 * Matches `class`, `className`, `:class` and `v-bind:class` attributes and
 * captures the quote character used and the raw attribute value.
 */
const CLASS_ATTR_REGEX = /(?:^|\s)(?:class|className|:class|v-bind:class)\s*=\s*(?<quote>["'])(?<value>.*?)\k<quote>/gs

/**
 * Matches `style`, `:style` and `v-bind:style` attributes and captures the
 * quote character used and the raw attribute value.
 */
const STYLE_ATTR_REGEX = /(?:^|\s)(?:style|:style|v-bind:style)\s*=\s*(?<quote>["'])(?<value>.*?)\k<quote>/gs

/**
 * Matches a CSS custom property name, e.g. `--sidebar-width`.
 */
const CSS_VAR_NAME_REGEX = /--[a-zA-Z0-9_-]+/g

/**
 * Binary operators that compare a value for equality; string literals used
 * as an operand of these must never be treated as class names, since they
 * are being compared against a variable (e.g. `side === 'left'`), not
 * rendered as a class.
 */
const EQUALITY_OPERATORS = new Set(['===', '!==', '==', '!='])

/**
 * Builds a matcher for CSS variable names that should be left untouched,
 * supporting simple `*` wildcards (e.g. `--reka-*`).
 *
 * @param {string[] | undefined} patterns
 */
function createVarExcludeMatcher(patterns) {
    if (!patterns || patterns.length === 0) {
        return () => false
    }

    const regexes = patterns.map(pattern => {
        const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')

        return new RegExp(`^${escaped}$`)
    })

    return (/** @type {string} */ name) => regexes.some(regex => regex.test(name))
}

/**
 * Builds the set of literal class names that must never receive the
 * prefix (e.g. `.dark`), normalized to strip the leading `.` so it can be
 * compared directly against a class token/selector class value.
 *
 * @param {string[] | undefined} patterns
 */
function createIgnoredClassSet(patterns) {
    return new Set((patterns || []).map(pattern => pattern.replace(/^\./, '')))
}


/**
 * Renames a single CSS custom property name (e.g. `--sidebar-width` ->
 * `--zkit-sidebar-width`), leaving it untouched if it's already prefixed or
 * matches the exclude matcher.
 *
 * @param {string} name
 * @param {string} prefix
 * @param {(name: string) => boolean} isExcluded
 */
function renameCssVarName(name, prefix, isExcluded) {
    if (!name.startsWith('--') || name.startsWith(`--${prefix}-`) || isExcluded(name)) {
        return name
    }

    return `--${prefix}-${name.slice(2)}`
}

/**
 * Renames every CSS custom property reference found inside a chunk of text
 * (e.g. `var(--sidebar-width)`, or the `--sidebar-width` inside Tailwind's
 * `w-(--sidebar-width)` shorthand), leaving anything that isn't a `--name`
 * token untouched.
 *
 * @param {string} text
 * @param {string} prefix
 * @param {(name: string) => boolean} isExcluded
 */
function renameCssVarRefs(text, prefix, isExcluded) {
    return text.replace(CSS_VAR_NAME_REGEX, match => renameCssVarName(match, prefix, isExcluded))
}

/**
 * @param {string} className
 * @param {string} prefix
 * @param {(name: string) => boolean} isExcluded
 * @param {Set<string>} ignoredClasses
 */
function prefixClassName(className, prefix, isExcluded, ignoredClasses) {
    if (!className) return className

    // a class that is exactly one of the ignored literal names (e.g. `dark`)
    // must be left completely untouched: no prefix, no embedded var rename
    if (ignoredClasses.has(className)) {
        return className
    }

    // rename any CSS variable reference embedded in the class itself, e.g.
    // `w-(--sidebar-width)` or `[calc(var(--sidebar-width)*-1)]`, so it stays
    // in sync with the renamed custom properties in the generated CSS
    const withRenamedVars = className.includes('--')
        ? renameCssVarRefs(className, prefix, isExcluded)
        : className

    if (withRenamedVars.startsWith(`${prefix}:`)) {
        return withRenamedVars
    }

    return `${prefix}:${withRenamedVars}`
}

/**
 * @param {string} value
 * @param {string} prefix
 * @param {(name: string) => boolean} isExcluded
 * @param {Set<string>} ignoredClasses
 */
function prefixClassList(value, prefix, isExcluded, ignoredClasses) {
    return value
        .split(/(\s+)/) // split keeping whitespace so original formatting is preserved
        .map(token => (token.trim() ? prefixClassName(token, prefix, isExcluded, ignoredClasses) : token))
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
 * @param {(name: string) => boolean} isExcluded
 * @param {Set<string>} ignoredClasses
 */
function prefixDynamicClassValue(value, prefix, isExcluded, ignoredClasses) {
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
            const newValue = prefixClassList(node.value, prefix, isExcluded, ignoredClasses)

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
 * Every CSS custom property (variable) declaration and usage is also
 * prefixed (e.g. `--sidebar-width` -> `--zkit-sidebar-width`), unless it
 * matches `excludeVars`, so the library's variables never collide with a
 * consuming app's own variables of the same name.
 *
 * Classes matching `ignoredClasses` exactly (e.g. `dark`) are left
 * completely untouched, even standalone in a selector such as
 * `:is(.dark *)`; compound/variant classes that merely contain the name
 * (e.g. `dark:bg-input`) are still prefixed as usual.
 *
 * @param {string} css
 * @param {string} prefix
 * @param {(name: string) => boolean} isExcluded
 * @param {Set<string>} ignoredClasses
 */
function prefixCss(css, prefix, isExcluded, ignoredClasses) {
    const root = postcss.parse(css)

    const transform = selectorParser(selectors => {
        selectors.walkClasses(classNode => {
            if (classNode.value.startsWith(`${prefix}:`)) return
            if (ignoredClasses.has(classNode.value)) return

            classNode.value = `${prefix}:${classNode.value}`
        })
    })

    root.walkRules(rule => {
        rule.selector = transform.processSync(rule.selector)
    })

    // rename every remaining `--name` token anywhere in the stylesheet:
    // declaration props/values, `@property --name { ... }` at-rules and any
    // custom property reference embedded in a selector (e.g. the
    // `--sidebar-width` inside `.zkit\:w-\(--sidebar-width\)`)
    return renameCssVarRefs(root.toString(), prefix, isExcluded)
}

/**
 * Renames CSS custom properties referenced inside a `:style`/`v-bind:style`
 * dynamic binding, so they stay in sync with the renamed variables in the
 * generated CSS: object keys that declare a custom property (e.g.
 * `{ '--sidebar-width': width }`) and any `var(--name)` reference inside a
 * string value (e.g. `{ '--normal-bg': 'var(--popover)' }`).
 *
 * Falls back to returning the original value unchanged if it cannot be
 * parsed as JavaScript.
 *
 * @param {string} value
 * @param {string} prefix
 * @param {(name: string) => boolean} isExcluded
 */
function prefixDynamicStyleValue(value, prefix, isExcluded) {
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

        if (isStringLiteral && node.value.includes('--')) {
            const quote = node.raw?.[0] === "'" ? "'" : '"'

            // object keys declaring a custom property (`'--sidebar-width': ...`)
            // are renamed wholesale; any other string is only scanned for
            // `var(--name)`-style references
            const isObjectKey = parent?.type === 'Property' && parent.key === node && !parent.computed

            const newValue = isObjectKey && node.value.startsWith('--')
                ? renameCssVarName(node.value, prefix, isExcluded)
                : renameCssVarRefs(node.value, prefix, isExcluded)

            if (newValue !== node.value) {
                s.overwrite(node.start, node.end, `${quote}${newValue}${quote}`)
                hasChanges = true
            }
        }

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
    const isExcludedVar = createVarExcludeMatcher(options?.excludeVars)
    const ignoredClasses = createIgnoredClassSet(options?.classes?.ignore)

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
                    newValue = prefixDynamicClassValue(value, prefix, isExcludedVar, ignoredClasses)
                } else {
                    newValue = prefixClassList(value, prefix, isExcludedVar, ignoredClasses)
                }

                if (newValue !== value) {
                    s.overwrite(valueStart, valueEnd, newValue)
                    hasChanges = true
                }
            }

            STYLE_ATTR_REGEX.lastIndex = 0

            while ((match = STYLE_ATTR_REGEX.exec(code))) {
                const fullMatch = match[0]
                const { quote, value } = /** @type {{ quote: string, value: string }} */ (match.groups)

                const quotedValue = `${quote}${value}${quote}`
                const relativeIndex = fullMatch.lastIndexOf(quotedValue)
                const valueStart = match.index + relativeIndex + 1
                const valueEnd = valueStart + value.length

                const isDynamicBinding = /^\s*(?::style|v-bind:style)\s*=/.test(fullMatch)

                const newValue = isDynamicBinding
                    ? prefixDynamicStyleValue(value, prefix, isExcludedVar)
                    : renameCssVarRefs(value, prefix, isExcludedVar)

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

                chunk.source = prefixCss(chunk.source, prefix, isExcludedVar, ignoredClasses)
            }
        },
    }

    return [sourcePlugin, cssPlugin]
}
