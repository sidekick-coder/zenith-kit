export function matchPath(pattern: string, path: string): boolean {
    // Split paths into segments
    const patternSegments = pattern.split('/').filter(Boolean)
    const pathSegments = path.split('/').filter(Boolean)

    // Check each segment
    for (let i = 0; i < patternSegments.length; i++) {
        const routeSegment = patternSegments[i]
        const requestSegment = pathSegments[i]

        // If route segment is a wildcard (*), it matches everything from this point
        if (routeSegment === '*') {
            return true
        }

        // If we've run out of request segments but still have route segments, no match
        if (i >= pathSegments.length) {
            return false
        }

        // If route segment is a parameter (starts with :), it matches any value
        if (routeSegment.startsWith(':')) {
            continue
        }

        // Otherwise, segments must match exactly
        if (routeSegment !== requestSegment) {
            return false
        }
    }

    // If we have more request segments than route segments (and no wildcard), no match
    if (pathSegments.length > patternSegments.length) {
        return false
    }

    return true
}
