import { ref, toValue, isRef, computed } from 'vue'
import type { MaybeRef } from 'vue'

export interface RGB {
    r: number
    g: number
    b: number
}

export interface RGBA extends RGB {
    a: number
}

export interface HSL {
    h: number
    s: number
    l: number
}

export interface OKLCH {
    l: number
    c: number
    h: number
}

export function extracRGB(color: string): RGB {
    const rgbMatch = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/.exec(color)

    if (!rgbMatch) {
        throw new Error('Invalid RGB color format: ' + color)
    }    
    
    return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3])
    }
}

export function extractRGBA(color: string): RGBA {
    const rgbaMatch = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/.exec(color)
    if (!rgbaMatch) {
        // fallback to rgb with alpha 1
        const rgb = extracRGB(color)
        return {
            ...rgb,
            a: 1 
        }
    }
    return {
        r: parseInt(rgbaMatch[1]),
        g: parseInt(rgbaMatch[2]),
        b: parseInt(rgbaMatch[3]),
        a: parseFloat(rgbaMatch[4])
    }
}

export function hexToRGB(hex: string): RGB {
    const hexMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

    if (!hexMatch) {
        throw new Error('Invalid HEX color format: ' + hex)
    }

    return {
        r: parseInt(hexMatch[1], 16),
        g: parseInt(hexMatch[2], 16),
        b: parseInt(hexMatch[3], 16)
    }
}

export function hslToRgb(hsl: string): RGB {
    const hslMatch = /hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*[\d.]+)?\)/.exec(hsl)

    if (!hslMatch) {
        throw new Error('Invalid HSL color format: ' + hsl)
    }

    const h = parseInt(hslMatch[1]) / 360
    const s = parseInt(hslMatch[2]) / 100
    const l = parseInt(hslMatch[3]) / 100

    let r: number
    let g: number
    let b: number

    if (s === 0) {
        r = g = b = l
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1 / 6) return p + (q - p) * 6 * t
            if (t < 1 / 2) return q
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
            return p
        }

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q

        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    }
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2

    if (max === min) {
        return {
            h: 0,
            s: 0,
            l: Math.round(l * 100)
        }
    }

    const d = max - min
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    let h = 0

    switch (max) {
    case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60
        break
    case g:
        h = ((b - r) / d + 2) * 60
        break
    case b:
        h = ((r - g) / d + 4) * 60
        break
    }

    return {
        h: Math.round(h),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    }
}

export function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => {
        const hex = n.toString(16)
        return hex.length === 1 ? '0' + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function rgbaToString(rgba: RGBA): string {
    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
}

export function extractOKLCH(color: string): OKLCH {
    const oklchMatch = /oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/.exec(color)

    if (!oklchMatch) {
        throw new Error('Invalid OKLCH color format: ' + color)
    }

    return {
        l: parseFloat(oklchMatch[1]),
        c: parseFloat(oklchMatch[2]),
        h: parseFloat(oklchMatch[3])
    }
}

export function oklchToRgb(color: string): RGB {
    const oklch = extractOKLCH(color)
    const { l, c, h } = oklch
    
    const hRad = (h * Math.PI) / 180
    const a = c * Math.cos(hRad)
    const b = c * Math.sin(hRad)
    
    const l_ = l + 0.3963377774 * a + 0.2158037573 * b
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b
    const s_ = l - 0.0894841775 * a - 1.2914855480 * b
    
    const l3 = l_ * l_ * l_
    const m3 = m_ * m_ * m_
    const s3 = s_ * s_ * s_
    
    let r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3
    let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3
    let blue = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3
    
    const gammaCorrect = (val: number): number => {
        if (val >= 0.0031308) {
            return 1.055 * Math.pow(val, 1 / 2.4) - 0.055
        }
        
        return 12.92 * val
    }
    
    r = gammaCorrect(r)
    g = gammaCorrect(g)
    blue = gammaCorrect(blue)
    
    return {
        r: Math.round(Math.max(0, Math.min(1, r)) * 255),
        g: Math.round(Math.max(0, Math.min(1, g)) * 255),
        b: Math.round(Math.max(0, Math.min(1, blue)) * 255)
    }
}

export function rgbToOklch(r: number, g: number, b: number): OKLCH {
    r = r / 255
    g = g / 255
    b = b / 255
    
    const gammaExpand = (val: number): number => {
        if (val >= 0.04045) {
            return Math.pow((val + 0.055) / 1.055, 2.4)
        }
        
        return val / 12.92
    }
    
    r = gammaExpand(r)
    g = gammaExpand(g)
    b = gammaExpand(b)
    
    const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    
    const l_ = Math.cbrt(l)
    const m_ = Math.cbrt(m)
    const s_ = Math.cbrt(s)
    
    const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
    const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
    const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    
    const C = Math.sqrt(a * a + b_ * b_)
    let H = Math.atan2(b_, a) * (180 / Math.PI)
    
    if (H < 0) {
        H += 360
    }
    
    return {
        l: Math.round(L * 1000) / 1000,
        c: Math.round(C * 1000) / 1000,
        h: Math.round(H * 1000) / 1000
    }
}

export function useColorType(payload?: MaybeRef<string | null | undefined>) {
    const color = isRef(payload) ? payload : ref<string | null | undefined>(toValue(payload))
    
    return computed<string | null>({
        get() {
            if (!color.value) {
                return null
            }

            if (color.value.startsWith('#')) {
                return 'hex'
            }

            if (/^rgba/.test(color.value)) {
                return 'rgba'
            }

            if (/^rgb/.test(color.value)) {
                return 'rgb'
            }

            if (/^oklch/.test(color.value)) {
                return 'oklch'
            }

            if (/^hsla/.test(color.value)) {
                return 'hsla'
            }

            if (/^hsl/.test(color.value)) {
                return 'hsl'
            }

            return 'unknown'
        },
        set(type) {
            if (!color.value || !type) {
                return
            }

            const currentRgb = useRGB(color).value

            if (!currentRgb) {
                return
            }

            if (type === 'hex') {
                color.value = rgbToHex(currentRgb.r, currentRgb.g, currentRgb.b)
                return
            }

            if (type === 'rgb') {
                color.value = `rgb(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b})`
                return
            }

            if (type === 'rgba') {
                color.value = `rgba(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}, 1)`
                return
            }

            if (type === 'hsl') {
                const hsl = rgbToHsl(currentRgb.r, currentRgb.g, currentRgb.b)
                color.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
                return
            }

            if (type === 'hsla') {
                const hsl = rgbToHsl(currentRgb.r, currentRgb.g, currentRgb.b)
                color.value = `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
                return
            }

            if (type === 'oklch') {
                const oklch = rgbToOklch(currentRgb.r, currentRgb.g, currentRgb.b)
                color.value = `oklch(${oklch.l} ${oklch.c} ${oklch.h})`
                return
            }
        }
    })
}

export function useRGB(payload?: MaybeRef<string | null | undefined>) {
    const color = isRef(payload) ? payload : ref<string | null | undefined>(toValue(payload))
    
    const type = useColorType(color)

    return computed<RGB | null>({
        get() {
            if (!color.value) {
                return null
            }

            if (type.value === 'rgba') {
                const rgba = extractRGBA(color.value)

                return {
                    r: rgba.r,
                    g: rgba.g,
                    b: rgba.b 
                }
            }

            if (type.value === 'rgb') {
                return extracRGB(color.value)
            }

            if (type.value === 'hex' && color.value.length === 7) {
                return hexToRGB(color.value)
            }

            if (type.value === 'hsl') {
                return hslToRgb(color.value)
            }

            if (type.value === 'oklch') {
                return oklchToRgb(color.value)
            }

            return null
        },
        set(){
            if (!color.value) {
                return
            }

            if (type.value === 'rgb') {
                const rgb = extracRGB(color.value)
                color.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
            }
            if (type.value === 'rgba') {
                const rgba = extractRGBA(color.value)
                color.value = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
            }
        }
    })
}

export function useRGBA(payload?: MaybeRef<string | null | undefined>) {
    const color = isRef(payload) ? payload : ref<string | null | undefined>(toValue(payload))
    
    const type = useColorType(color)
    const rgb = useRGB(color)

    return computed<RGBA | null>({
        get() {
            if (!rgb.value) {
                return null
            }

            if (type.value === 'rgba') {
                return extractRGBA(color.value!)
            }

            return {
                ...rgb.value,
                a: 1
            }
        },
        set(value) {
            if (!value || !color.value) {
                return
            }

            if (type.value === 'rgba') {
                color.value = `rgba(${value.r}, ${value.g}, ${value.b}, ${value.a})`
                return
            }

            if (type.value === 'rgb') {
                color.value = `rgb(${value.r}, ${value.g}, ${value.b})`
                return
            }
        }
    })
}

export function useHSL(payload?: MaybeRef<string | null | undefined>) {
    const color = isRef(payload) ? payload : ref<string | null | undefined>(toValue(payload))
    
    const type = useColorType(color)
    const rgb = useRGB(color)

    return computed<HSL | null>({
        get() {
            if (!rgb.value) {
                return null
            }

            return rgbToHsl(rgb.value.r, rgb.value.g, rgb.value.b)
        },
        set(value) {
            if (!value || !color.value) {
                return
            }

            if (type.value === 'hsl') {
                color.value = `hsl(${value.h}, ${value.s}%, ${value.l}%)`
                return
            }
            
            if (type.value === 'hsla') {
                color.value = `hsla(${value.h}, ${value.s}%, ${value.l}%)`
                return
            }

            if (type.value === 'hex') {
                const rgb = hslToRgb(`hsl(${value.h}, ${value.s}%, ${value.l}%)`)
                color.value = rgbToHex(rgb.r, rgb.g, rgb.b)
                return
            }

            if (type.value === 'rgba') {
                const rgb = hslToRgb(`hsl(${value.h}, ${value.s}%, ${value.l}%)`)
                color.value = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`
                return
            }

            if (type.value === 'rgb') {
                const rgb = hslToRgb(`hsl(${value.h}, ${value.s}%, ${value.l}%)`)
                color.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
                return
            }

            if (type.value === 'oklch') {
                const rgb = hslToRgb(`hsl(${value.h}, ${value.s}%, ${value.l}%)`)
                const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b)
                color.value = `oklch(${oklch.l} ${oklch.c} ${oklch.h})`
                return
            }
        }
    })
}

export function useHex(payload?: MaybeRef<string | null | undefined>) {
    const color = isRef(payload) ? payload : ref<string | null | undefined>(toValue(payload))
    
    const type = useColorType(color)
    const rgb = useRGB(color)

    return computed<string | null>({
        get() {
            if (!rgb.value) {
                return null
            }

            return rgbToHex(rgb.value.r, rgb.value.g, rgb.value.b)
        },
        set(value) {
            if (!value) {
                return
            }

            if (type.value === 'hex') {
                color.value = value.startsWith('#') ? value : `#${value}`
                return
            }

        }
    })
}

export function useColor(payload?: MaybeRef<string | null | undefined>) {
    const color = isRef(payload) ? payload : ref<string | null | undefined>(toValue(payload))    
    const type = useColorType(color)
    const hex = useHex(color)
    const rgb = useRGB(color)
    const rgba = useRGBA(color)
    const hsl = useHSL(color)

    
    const oklch = computed<OKLCH | null>({
        get() {
            if (!rgb.value) {
                return null
            }

            return rgbToOklch(rgb.value.r, rgb.value.g, rgb.value.b)
        },
        set(value) {
            if (!value) {
                return
            }

            if (type.value === 'oklch') {
                color.value = `oklch(${value.l} ${value.c} ${value.h})`
                return
            }

            const rgb = oklchToRgb(`oklch(${value.l} ${value.c} ${value.h})`)
            
            if (type.value === 'hex') {
                color.value = rgbToHex(rgb.r, rgb.g, rgb.b)
                return
            }

            if (type.value === 'rgb') {
                color.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
                return
            }
        }
    })

    return {
        type,
        color,
        hex,
        rgb,
        hsl,
        oklch,
        rgba
    }
}
