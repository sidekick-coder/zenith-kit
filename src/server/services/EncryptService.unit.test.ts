import {
    describe,
    it,
    expect
} from 'vitest'
import EncryptService from './EncryptService.ts'

describe('EncryptService', () => {
    it('should encrypt and decrypt text correctly', () => {
        const service = EncryptService.create({
            key: 'test-secret-key',
        })
        
        const originalText = 'Hello, World!'
        
        const encrypted = service.encrypt(originalText)        
        
        expect(encrypted).not.toBe(originalText)
        
        const decrypted = service.decrypt(encrypted)

        expect(decrypted).toBe(originalText)
    })
})
