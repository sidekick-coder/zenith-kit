import {
    beforeEach,
    describe,
    expect,
    it
} from 'vitest'
import ConfigService from './ConfigService.ts'

describe('ConfigService', () => {
    let config: ConfigService

    beforeEach(() => {
        config = new ConfigService()
    })

    describe('parseValue', () => {
        it('should convert ":boolean" suffix strings to boolean true', () => {
            expect(config.parseValue('true:boolean')).toBe(true)
        })

        it('should convert ":boolean" suffix strings to boolean false', () => {
            expect(config.parseValue('false:boolean')).toBe(false)
        })

        it('should return non-boolean strings as-is', () => {
            expect(config.parseValue('hello')).toBe('hello')
        })

        it('should return non-string values as-is', () => {
            expect(config.parseValue(42)).toBe(42)
            expect(config.parseValue(null)).toBe(null)
            expect(config.parseValue({ a: 1 })).toEqual({ a: 1 })
        })
    })

    describe('loadFromRecord', () => {
        it('should load entries from a record', () => {
            config.loadFromRecord({ key1: 'value1', key2: 'value2' })
            expect(config.get('key1')).toBe('value1')
            expect(config.get('key2')).toBe('value2')
        })

        it('should store the provided source', () => {
            config.loadFromRecord({ key1: 'value1' }, 'test-source')
            expect(config.list()[0].source).toBe('test-source')
        })

        it('should default source to "unknow"', () => {
            config.loadFromRecord({ key1: 'value1' })
            expect(config.list()[0].source).toBe('unknow')
        })

        it('should parse values when loading', () => {
            config.loadFromRecord({ flag: 'true:boolean' })
            expect(config.get('flag')).toBe(true)
        })
    })

    describe('loadFromEntries', () => {
        it('should load entries from an array of tuples', () => {
            config.loadFromEntries([['key1', 'value1'], ['key2', 42]])
            expect(config.get('key1')).toBe('value1')
            expect(config.get('key2')).toBe(42)
        })

        it('should store the provided source', () => {
            config.loadFromEntries([['key1', 'value1']], 'env')
            expect(config.list()[0].source).toBe('env')
        })
    })

    describe('list', () => {
        it('should return all entries as an array', () => {
            config.loadFromRecord({ a: 1, b: 2 })
            expect(config.list()).toHaveLength(2)
        })

        it('should return empty array when no entries', () => {
            expect(config.list()).toEqual([])
        })
    })

    describe('toRecord', () => {
        it('should convert entries to a plain record', () => {
            config.loadFromRecord({ a: 1, b: 'two' })
            expect(config.toRecord()).toEqual({ a: 1, b: 'two' })
        })
    })

    describe('has', () => {
        it('should return true for existing flat keys', () => {
            config.set('foo', 'bar')
            expect(config.has('foo')).toBe(true)
        })

        it('should return false for missing flat keys', () => {
            expect(config.has('missing')).toBe(false)
        })

        it('should return true for nested keys inside object values', () => {
            config.set('db', { host: 'localhost' })
            expect(config.has('db.host')).toBe(true)
        })

        it('should return false for missing nested keys', () => {
            config.set('db', { host: 'localhost' })
            expect(config.has('db.port')).toBe(false)
        })

        it('should return false for dot-notation key when primary value is not an object', () => {
            config.set('db', 'not-an-object')
            expect(config.has('db.host')).toBe(false)
        })
    })

    describe('get', () => {
        it('should return the value for an existing key', () => {
            config.set('name', 'zenith')
            expect(config.get('name')).toBe('zenith')
        })

        it('should return defaultValue for a missing key', () => {
            expect(config.get('missing', 'default')).toBe('default')
        })

        it('should return undefined when no defaultValue given for missing key', () => {
            expect(config.get('missing')).toBeUndefined()
        })

        it('should support dot-notation to access nested object properties', () => {
            config.set('db', { host: 'localhost', port: 5432 })
            expect(config.get('db.host')).toBe('localhost')
            expect(config.get('db.port')).toBe(5432)
        })

        it('should return defaultValue for missing nested key', () => {
            config.set('db', { host: 'localhost' })
            expect(config.get('db.port', 3306)).toBe(3306)
        })

        it('should return defaultValue when primary key value is not an object', () => {
            config.set('db', 'flat')
            expect(config.get('db.host', 'fallback')).toBe('fallback')
        })
    })

    describe('getOne', () => {
        it('should return the first found value from a list of keys', () => {
            config.set('b', 'found')
            expect(config.getOne(['a', 'b', 'c'])).toBe('found')
        })

        it('should return defaultValue when none of the keys exist', () => {
            expect(config.getOne(['x', 'y'], 'fallback')).toBe('fallback')
        })

        it('should return undefined when no keys exist and no default provided', () => {
            expect(config.getOne(['x', 'y'])).toBeUndefined()
        })
    })

    describe('set', () => {
        it('should set a flat key', () => {
            config.set('env', 'production')
            expect(config.get('env')).toBe('production')
        })

        it('should set a nested key using dot-notation', () => {
            config.set('db.host', 'localhost')
            expect(config.get('db.host')).toBe('localhost')
        })

        it('should merge nested keys under the same primary key', () => {
            config.set('db.host', 'localhost')
            config.set('db.port', 5432)
            expect(config.get('db.host')).toBe('localhost')
            expect(config.get('db.port')).toBe(5432)
        })

        it('should overwrite an existing flat key', () => {
            config.set('env', 'dev')
            config.set('env', 'prod')
            expect(config.get('env')).toBe('prod')
        })
    })

    describe('unset', () => {
        it('should remove a flat key', () => {
            config.set('temp', 'value')
            config.unset('temp')
            expect(config.has('temp')).toBe(false)
        })

        it('should remove a nested key using dot-notation', () => {
            config.set('db', { host: 'localhost', port: 5432 })
            config.unset('db.port')
            expect(config.has('db.port')).toBe(false)
            expect(config.get('db.host')).toBe('localhost')
        })

        it('should do nothing when unsetting a non-existent key', () => {
            expect(() => config.unset('nonexistent')).not.toThrow()
        })
    })

    describe('clear', () => {
        it('should remove all entries', () => {
            config.loadFromRecord({ a: 1, b: 2 })
            config.clear()
            expect(config.list()).toHaveLength(0)
        })
    })

    describe('dump', () => {
        it('should return a flattened record of all entries', () => {
            config.set('db', { host: 'localhost', port: 5432 })
            const dumped = config.dump()
            expect(dumped['db.host']).toBe('localhost')
            expect(dumped['db.port']).toBe(5432)
        })

        it('should include flat keys in the dump', () => {
            config.set('env', 'test')
            expect(config.dump()).toMatchObject({ env: 'test' })
        })
    })
})
