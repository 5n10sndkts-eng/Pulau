import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useKV } from '@github/spark'
import { generateSessionToken, verifySessionToken, shouldRefreshSession, isSessionExpired } from '@/lib/session'
import type { Session } from '@/types/session'
import type { User } from '@/lib/types'

interface AuthContextType {
  session: Session | null
  user: User | null
  isAuthenticated: boolean
  login: (session: Session, user: User) => void
  logout: () => void
  refreshSession: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSessionState] = useState<Session | null>(null)
  const [user, setUserState] = useState<User | null>(null)
  const [storedSession, setStoredSession] = useKV<Session | null>('session', null)
  const [storedUser, setStoredUser] = useKV<User | null>('current_user', null)

  // Initialize auth state from storage
  useEffect(() => {
    const savedSession = storedSession
    const savedUser = storedUser

    if (savedSession && savedUser) {
      // Verify session is still valid
      const payload = verifySessionToken(savedSession.token)
      
      if (payload) {
        setSessionState(savedSession)
        setUserState(savedUser)

        // Check if session needs refresh
        if (shouldRefreshSession(savedSession)) {
          refreshSession()
        }
      } else {
        // Session expired, clear storage
        setStoredSession(null)
        setStoredUser(null)
      }
    }
  }, []) // Run once on mount

  const login = (newSession: Session, newUser: User) => {
    setSessionState(newSession)
    setUserState(newUser)
    setStoredSession(newSession)
    setStoredUser(newUser)
  }

  const logout = () => {
    setSessionState(null)
    setUserState(null)
    setStoredSession(null)
    setStoredUser(null)
  }

  const refreshSession = () => {
    if (!session || !user) return

    // Generate new session with same user
    const newSession = generateSessionToken(session.userId, session.email)
    setSessionState(newSession)
    setStoredSession(newSession)
  }

  // Auto-refresh check interval (every hour)
  useEffect(() => {
    if (!session) return

    const interval = setInterval(() => {
      if (isSessionExpired(session)) {
        logout()
      } else if (shouldRefreshSession(session)) {
        refreshSession()
      }
    }, 60 * 60 * 1000) // Check every hour

    return () => clearInterval(interval)
  }, [session])

  const value: AuthContextType = {
    session,
    user,
    isAuthenticated: !!session && !!user,
    login,
    logout,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
