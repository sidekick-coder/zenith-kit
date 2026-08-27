import {
    describe,
    it,
    expect,
    vi
} from 'vitest'
import Router from './RouterService.ts'

describe('Router', () => {
    it('should add GET route and resolve it', () => {
        const router = new Router()
        const handler = vi.fn()
        router.get('/test', handler)
        const route = router.resolve('GET', '/test')
        expect(route).toBeTruthy()
        expect(route?.handler).toBe(handler)
    })

    it('should add POST route and resolve it', () => {
        const router = new Router()
        const handler = vi.fn()
        router.post('/submit', handler)
        const route = router.resolve('POST', '/submit')
        expect(route).toBeTruthy()
        expect(route?.handler).toBe(handler)
    })

    it('should return null for non-existent route', () => {
        const router = new Router()
        const route = router.resolve('GET', '/notfound')
        expect(route).toBeNull()
    })

    it('should add and resolve wildcard route', () => {
        const router = new Router()
        const handler = vi.fn()
        router.get('/files/*', handler)
        const route = router.resolve('GET', '/files/documents/test.pdf')
        expect(route).toBeTruthy()
        expect(route?.handler).toBe(handler)
    })
})
