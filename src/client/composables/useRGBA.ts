export function useRGBA(payload?: MaybeRef<string | null | undefined>) {
    const color = isRef(payload) ? payload : ref<string | null | undefined>(toValue(payload))
    const type = useColorType(color)

    return computed<RGBA | null>({
        get() {
            if (!color.value) return null
            if (type.value === 'rgba') return extractRGBA(color.value)
            if (type.value === 'rgb') {
                const rgb = extracRGB(color.value)
                return { ...rgb, a: 1 }
            }
            if (type.value === 'hex' && color.value.length === 7) {
                const rgb = hexToRGB(color.value)
                return { ...rgb, a: 1 }
            }
            if (type.value === 'hsl') {
                const rgb = hslToRgb(color.value)
                return { ...rgb, a: 1 }
            }
            if (type.value === 'oklch') {
                const rgb = oklchToRgb(color.value)
                return { ...rgb, a: 1 }
            }
            return null
        },
        set(value) {
            if (!value || !color.value) return
            color.value = `rgba(${value.r}, ${value.g}, ${value.b}, ${value.a})`
        }
    })
}
