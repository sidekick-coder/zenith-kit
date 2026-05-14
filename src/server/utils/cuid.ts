import crypto from 'crypto'

export function cuid(){
    const randomBytes = new Uint8Array(8)
    
    crypto.getRandomValues(randomBytes)
    
    const random = Array.from(randomBytes, b => b.toString(36).padStart(2, '0')).join('')
  
    const timestamp = Date.now().toString(36)

    return `c${timestamp}${random.slice(0, 12)}`
}

