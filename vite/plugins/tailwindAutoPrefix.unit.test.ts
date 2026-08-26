import { describe, expect, it } from 'vitest'
import tailwindAutoPrefix from './tailwindAutoPrefix.js'

/**
 * Helper to run the source plugin's transform hook directly, bypassing vite internals.
 */
function transform(code: string, id: string, options: Parameters<typeof tailwindAutoPrefix>[0]) {
    const [sourcePlugin] = tailwindAutoPrefix(options)

    // @ts-expect-error - transform is a function in this plugin's implementation
    const result = sourcePlugin.transform(code, id)

    return result ? result.code : null
}

/**
 * Helper to run the CSS plugin's generateBundle hook directly, bypassing vite internals.
 */
function generateCss(source: string, options: Parameters<typeof tailwindAutoPrefix>[0]) {
    const [, cssPlugin] = tailwindAutoPrefix(options)

    const bundle: Record<string, any> = {
        'styles.css': { type: 'asset', source },
    }

    // @ts-expect-error - generateBundle is a function in this plugin's implementation
    cssPlugin.generateBundle({}, bundle)

    return bundle['styles.css'].source
}

describe('tailwindAutoPrefix.js', () => {
    it('throws when no prefix is provided', () => {
        // @ts-expect-error - intentionally omitting required option
        expect(() => tailwindAutoPrefix({})).toThrow('"prefix" option is required')
    })

    it('prefixes classes in a static class attribute', () => {
        const code = `<div class="flex p-4 hover:bg-red-500"></div>`

        const result = transform(code, 'test.vue', { prefix: 'tw' })

        expect(result).toBe(`<div class="tw:flex tw:p-4 tw:hover:bg-red-500"></div>`)
    })

    it('prefixes classes in a className attribute', () => {
        const code = `<span className="text-sm font-bold"></span>`

        const result = transform(code, 'test.tsx', { prefix: 'tw' })

        expect(result).toBe(`<span className="tw:text-sm tw:font-bold"></span>`)
    })

    it('prefixes only string literals inside a :class binding', () => {
        const code = `<p :class="['a b', active ? 'c' : '']"></p>`

        const result = transform(code, 'test.vue', { prefix: 'tw' })

        expect(result).toBe(`<p :class="['tw:a tw:b', active ? 'tw:c' : '']"></p>`)
    })

    it('prefixes only string literals inside a v-bind:class binding', () => {
        const code = `<p v-bind:class="isOpen ? 'block' : 'hidden'"></p>`

        const result = transform(code, 'test.vue', { prefix: 'tw' })

        expect(result).toBe(`<p v-bind:class="isOpen ? 'tw:block' : 'tw:hidden'"></p>`)
    })

    it('does not prefix string literals compared against a variable with ===', () => {
        const code = `<div :class="side === 'left' ? 'left-0' : 'right-0'"></div>`

        const result = transform(code, 'test.vue', { prefix: 'tw' })

        // 'left'/'right' are comparison operands (not classes) and must stay
        // untouched, only the ternary branches are actual class values
        expect(result).toBe(`<div :class="side === 'left' ? 'tw:left-0' : 'tw:right-0'"></div>`)
    })

    it('does not prefix string literals compared against a variable with !==', () => {
        const code = `<div :class="variant !== 'floating' ? 'p-2' : 'p-4'"></div>`

        const result = transform(code, 'test.vue', { prefix: 'tw' })

        expect(result).toBe(`<div :class="variant !== 'floating' ? 'tw:p-2' : 'tw:p-4'"></div>`)
    })

    it('does not prefix string literals compared on the left-hand side of ===', () => {
        const code = `<div :class="'left' === side ? 'left-0' : 'right-0'"></div>`

        const result = transform(code, 'test.vue', { prefix: 'tw' })

        expect(result).toBe(`<div :class="'left' === side ? 'tw:left-0' : 'tw:right-0'"></div>`)
    })

    it('prefixes object-syntax class bindings by key, leaving the condition untouched', () => {
        const code = `<div :class="{ 'text-red-500': hasError, 'text-green-500': isValid }"></div>`

        const result = transform(code, 'test.vue', { prefix: 'tw' })

        expect(result).toBe(`<div :class="{ 'tw:text-red-500': hasError, 'tw:text-green-500': isValid }"></div>`)
    })

    it('prefixes multiple class comparisons like the real Sidebar component', () => {
        const code = `<div :class="cn(
            'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) md:flex',
            side === 'left'
                ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
                : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
        )"></div>`

        const result = transform(code, 'test.vue', { prefix: 'zkit' })

        expect(result).toContain(`side === 'left'`)
        expect(result).toContain(`'zkit:left-0 zkit:group-data-[collapsible=offcanvas]:left-[calc(var(--zkit-sidebar-width)*-1)]'`)
        expect(result).toContain(`'zkit:right-0 zkit:group-data-[collapsible=offcanvas]:right-[calc(var(--zkit-sidebar-width)*-1)]'`)
        expect(result).not.toContain(`'zkit:left'`)
        expect(result).not.toContain(`'zkit:right'`)
    })

    it('leaves plain variable :class bindings untouched', () => {
        const code = `<p :class="isOpen"></p>`

        const result = transform(code, 'test.vue', { prefix: 'tw' })

        expect(result).toBeNull()
    })

    it('does not double-prefix classes that are already prefixed', () => {
        const code = `<div class="tw:flex p-4"></div>`

        const result = transform(code, 'test.vue', { prefix: 'tw' })

        expect(result).toBe(`<div class="tw:flex tw:p-4"></div>`)
    })

    it('returns null when there is nothing to change', () => {
        const code = `<div class="tw:flex tw:p-4"></div>`

        const result = transform(code, 'test.vue', { prefix: 'tw' })

        expect(result).toBeNull()
    })

    it('respects the include option', () => {
        const code = `<div class="flex"></div>`

        const result = transform(code, 'test.css', { prefix: 'tw', include: '**/*.vue' })

        expect(result).toBeNull()
    })

    it('respects the exclude option', () => {
        const code = `<div class="flex"></div>`

        const result = transform(code, `${process.cwd()}/node_modules/foo/test.vue`, { prefix: 'tw', exclude: 'node_modules/**' })

        expect(result).toBeNull()
    })
})

describe('tailwindAutoPrefix.js CSS plugin', () => {
    it('prefixes plain class selectors in generated CSS', () => {
        const css = `.flex{display:flex}`

        const result = generateCss(css, { prefix: 'zkit' })

        expect(result).toBe(`.zkit\\:flex{display:flex}`)
    })

    it('prefixes class selectors with variants, preserving escaped colons', () => {
        const css = `.hover\\:bg-red-500:hover{background-color:red}`

        const result = generateCss(css, { prefix: 'zkit' })

        expect(result).toBe(`.zkit\\:hover\\:bg-red-500:hover{background-color:red}`)
    })

    it('prefixes arbitrary variant selectors such as data attributes', () => {
        const css = `.data-\\[state\\=open\\]\\:animate-in[data-state=open]{opacity:1}`

        const result = generateCss(css, { prefix: 'zkit' })

        expect(result).toBe(`.zkit\\:data-\\[state\\=open\\]\\:animate-in[data-state=open]{opacity:1}`)
    })

    it('does not double-prefix already-prefixed selectors', () => {
        const css = `.zkit\\:flex{display:flex}`

        const result = generateCss(css, { prefix: 'zkit' })

        expect(result).toBe(`.zkit\\:flex{display:flex}`)
    })

    it('ignores non-css assets in the bundle', () => {
        const [, cssPlugin] = tailwindAutoPrefix({ prefix: 'zkit' })

        const bundle: Record<string, any> = {
            'index.es.js': { type: 'chunk', code: '.flex{}' },
        }

        // @ts-expect-error - generateBundle is a function in this plugin's implementation
        cssPlugin.generateBundle({}, bundle)

        expect(bundle['index.es.js'].code).toBe('.flex{}')
    })

    it('prefixes a css custom property declaration and its var() usage', () => {
        const css = `:root{--sidebar-width:16rem}.w-\\(--sidebar-width\\){width:var(--sidebar-width)}`

        const result = generateCss(css, { prefix: 'zkit' })

        expect(result).toBe(`:root{--zkit-sidebar-width:16rem}.zkit\\:w-\\(--zkit-sidebar-width\\){width:var(--zkit-sidebar-width)}`)
    })

    it('prefixes @property at-rules declaring a custom property', () => {
        const css = `@property --tw-translate-x{syntax:"*";inherits:false;initial-value:0}`

        const result = generateCss(css, { prefix: 'zkit' })

        expect(result).toBe(`@property --zkit-tw-translate-x{syntax:"*";inherits:false;initial-value:0}`)
    })

    it('does not double-prefix an already-prefixed css variable', () => {
        const css = `:root{--zkit-sidebar-width:16rem}`

        const result = generateCss(css, { prefix: 'zkit' })

        expect(result).toBe(`:root{--zkit-sidebar-width:16rem}`)
    })

    it('leaves excluded css variables untouched', () => {
        const css = `:root{--reka-navigation-menu-viewport-height:100px}.foo{height:var(--reka-navigation-menu-viewport-height)}`

        const result = generateCss(css, { prefix: 'zkit', excludeVars: ['--reka-*'] })

        expect(result).toBe(`:root{--reka-navigation-menu-viewport-height:100px}.zkit\\:foo{height:var(--reka-navigation-menu-viewport-height)}`)
    })
})

describe('tailwindAutoPrefix.js style bindings', () => {
    it('prefixes a css variable reference embedded in a class', () => {
        const code = `<div class="w-(--sidebar-width)"></div>`

        const result = transform(code, 'test.vue', { prefix: 'zkit' })

        expect(result).toBe(`<div class="zkit:w-(--zkit-sidebar-width)"></div>`)
    })

    it('prefixes a css variable reference inside an arbitrary value class', () => {
        const code = `<div :class="'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+2px)]'"></div>`

        const result = transform(code, 'test.vue', { prefix: 'zkit' })

        expect(result).toBe(`<div :class="'zkit:group-data-[collapsible=icon]:w-[calc(var(--zkit-sidebar-width-icon)+2px)]'"></div>`)
    })

    it('prefixes a custom property key set via a dynamic :style binding', () => {
        const code = `<div :style="{ '--sidebar-width': SIDEBAR_WIDTH }"></div>`

        const result = transform(code, 'test.vue', { prefix: 'zkit' })

        expect(result).toBe(`<div :style="{ '--zkit-sidebar-width': SIDEBAR_WIDTH }"></div>`)
    })

    it('prefixes var() references inside a dynamic :style binding value', () => {
        const code = `<div :style="{ '--normal-bg': 'var(--popover)', '--normal-text': 'var(--popover-foreground)' }"></div>`

        const result = transform(code, 'test.vue', { prefix: 'zkit' })

        expect(result).toBe(`<div :style="{ '--zkit-normal-bg': 'var(--zkit-popover)', '--zkit-normal-text': 'var(--zkit-popover-foreground)' }"></div>`)
    })

    it('prefixes var() references inside a static style attribute', () => {
        const code = `<div style="--sidebar-width: 16rem; width: var(--sidebar-width)"></div>`

        const result = transform(code, 'test.vue', { prefix: 'zkit' })

        expect(result).toBe(`<div style="--zkit-sidebar-width: 16rem; width: var(--zkit-sidebar-width)"></div>`)
    })

    it('respects excludeVars for both class-embedded and :style bindings', () => {
        const code = `<div class="w-(--reka-viewport-width)" :style="{ '--reka-viewport-width': width }"></div>`

        const result = transform(code, 'test.vue', { prefix: 'zkit', excludeVars: ['--reka-*'] })

        expect(result).toBe(`<div class="zkit:w-(--reka-viewport-width)" :style="{ '--reka-viewport-width': width }"></div>`)
    })
})

describe('tailwindAutoPrefix.js classes.ignore', () => {
    it('leaves a standalone ignored class untouched in a static class attribute', () => {
        const code = `<div class="dark"></div>`

        const result = transform(code, 'test.vue', { prefix: 'zkit', classes: { ignore: ['.dark'] } })

        expect(result).toBeNull()
    })

    it('still prefixes other classes alongside an ignored one', () => {
        const code = `<div class="dark flex p-4"></div>`

        const result = transform(code, 'test.vue', { prefix: 'zkit', classes: { ignore: ['.dark'] } })

        expect(result).toBe(`<div class="dark zkit:flex zkit:p-4"></div>`)
    })

    it('still prefixes compound variant classes that merely contain the ignored name', () => {
        const code = `<div class="dark:bg-input/30"></div>`

        const result = transform(code, 'test.vue', { prefix: 'zkit', classes: { ignore: ['.dark'] } })

        expect(result).toBe(`<div class="zkit:dark:bg-input/30"></div>`)
    })

    it('leaves an ignored class untouched inside a dynamic :class binding', () => {
        const code = `<div :class="['dark', 'flex']"></div>`

        const result = transform(code, 'test.vue', { prefix: 'zkit', classes: { ignore: ['.dark'] } })

        expect(result).toBe(`<div :class="['dark', 'zkit:flex']"></div>`)
    })

    it('leaves the literal .dark selector untouched in generated CSS while still renaming its custom properties', () => {
        const css = `.dark{--background:oklch(14.1% .005 285.823)}`

        const result = generateCss(css, { prefix: 'zkit', classes: { ignore: ['.dark'] } })

        expect(result).toBe(`.dark{--zkit-background:oklch(14.1% .005 285.823)}`)
    })

    it('still prefixes the compound dark: variant utility while leaving the .dark ancestor selector untouched', () => {
        const css = `.dark\\:bg-input\\/30:is(.dark *){background-color:red}`

        const result = generateCss(css, { prefix: 'zkit', classes: { ignore: ['.dark'] } })

        expect(result).toBe(`.zkit\\:dark\\:bg-input\\/30:is(.dark *){background-color:red}`)
    })

    it('does not ignore any class when classes.ignore is not provided', () => {
        const css = `.dark{--background:oklch(14.1% .005 285.823)}`

        const result = generateCss(css, { prefix: 'zkit' })

        expect(result).toBe(`.zkit\\:dark{--zkit-background:oklch(14.1% .005 285.823)}`)
    })
})
