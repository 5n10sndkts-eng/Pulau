/**
 * Password hashing utilities using Web Crypto API
 * bcrypt is not available in browser environments
 */

/**
 * Hash a password using PBKDF2
 * @param password - Plain text password
 * @returns Hashed password string with salt
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const passwordBuffer = encoder.encode(password)

  const key = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    256
  )

  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const saltArray = Array.from(salt)
  
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  const saltHex = saltArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return `${saltHex}:${hashHex}`
}

/**
 * Verify a password against a hashed password
 * @param password - Plain text password to verify
 * @param hashedPassword - Hashed password with salt (format: salt:hash)
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [saltHex, hashHex] = hashedPassword.split(':')
  
  if (!saltHex || !hashHex) {
    return false
  }

  const encoder = new TextEncoder()
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) ?? [])
  const passwordBuffer = encoder.encode(password)

  const key = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    256
  )

  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const computedHashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return computedHashHex === hashHex
}

/**
 * Generate a UUID v4
 * @returns UUID string
 */
export function generateUUID(): string {
  return crypto.randomUUID()
}
