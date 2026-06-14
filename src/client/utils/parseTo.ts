import route from '#client/facades/route.ts' 

export function parseTo(to: string) {
    let result = to

    // replace :param with route param value
    for (const [key, value] of Object.entries(route.params)) {
        const paramPlaceholder = `:${key}`

        result = result.replace(paramPlaceholder, String(value))
    }

    return result
}

