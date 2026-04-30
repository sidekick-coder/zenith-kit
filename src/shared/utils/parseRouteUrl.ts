import qs from 'qs' 

export function parseUrlParams(routePath: string, requestPath: string): Record<string, string> {
    const params: Record<string, string> = {}

    const routeSegments = routePath.split('/').filter(Boolean)
    const requestSegments = requestPath.split('/').filter(Boolean)

    for (let i = 0; i < routeSegments.length; i++) {
        const routeSegment = routeSegments[i]
        const requestSegment = requestSegments[i]

        if (routeSegment.startsWith(':')) {
            const paramName = routeSegment.slice(1) // Remove the ':' prefix
            params[paramName] = requestSegment
        }

        if (routeSegment === '*') {
            // Capture all remaining segments as a single path
            const remainingSegments = requestSegments.slice(i)
            params['*'] = remainingSegments.join('/')
            break
        }
    }

    return params
}

export function parseUrlQuery(requestPath: string): Record<string, any> {
    const query: Record<string, string> = {}
    const queryString = requestPath.split('?')[1]

    if (!queryString) {
        return query
    }

    return qs.parse(queryString)
}
