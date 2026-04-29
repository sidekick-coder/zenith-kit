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

    it('should extract params from route', () => {
        const router = new Router()
        const params = router.extractParams('/user/:id', '/user/123')
        expect(params).toEqual({ id: '123' })
    })

    it('should extract query from request path', () => {
        const router = new Router()
        const query = router.extractQuery('/search?term=abc&sort=desc')
        expect(query).toEqual({
            term: 'abc',
            sort: 'desc' 
        })
    })

    it('should match path with params', () => {
        const router = new Router()
        const match = router.matchPath('/user/:id', '/user/123')
        expect(match).toBe(true)
    })

    it('should not match path with different segments', () => {
        const router = new Router()
        const match = router.matchPath('/user/:id', '/profile/123')
        expect(match).toBe(false)
    })

    it('should match path with wildcard spread parameter', () => {
        const router = new Router()
        const match = router.matchPath('/files/*', '/files/documents/folder/file.txt')
        expect(match).toBe(true)
    })

    it('should extract spread parameter from wildcard route', () => {
        const router = new Router()
        const params = router.extractParams('/files/*', '/files/documents/folder/file.txt')
        expect(params).toEqual({ '*': 'documents/folder/file.txt' })
    })

    it('should match wildcard at root level', () => {
        const router = new Router()
        const match = router.matchPath('*', '/any/path/here')
        expect(match).toBe(true)
    })

    it('should extract root level wildcard parameter', () => {
        const router = new Router()
        const params = router.extractParams('*', '/any/path/here')
        expect(params).toEqual({ '*': 'any/path/here' })
    })

    it('should match empty path with wildcard', () => {
        const router = new Router()
        const match = router.matchPath('*', '/')
        expect(match).toBe(true)
    })

    it('should extract empty wildcard parameter', () => {
        const router = new Router()
        const params = router.extractParams('*', '/')
        expect(params).toEqual({ '*': '' })
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
