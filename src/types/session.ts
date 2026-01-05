/**
 * Session and authentication types
 */
export interface Session {
  token: string
  userId: string
  email: string
  expiresAt: string
  createdAt: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

/**
 * JWT payload structure
 */
export interface JWTPayload {
  userId: string
  email: string
  iat: number // issued at
  exp: number // expires at
}
