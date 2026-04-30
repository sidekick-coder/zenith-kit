import { breakpointsTailwind, useBreakpoints as coreUseBreakpoints } from '@vueuse/core'

export function useBreakpoints() {
    return coreUseBreakpoints(breakpointsTailwind)
}
