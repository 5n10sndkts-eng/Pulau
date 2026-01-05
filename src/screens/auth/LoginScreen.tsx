import { useState, useRef } from 'react'
import { useKV } from '@github/spark'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { verifyPassword } from '@/lib/crypto'
import { generateSessionToken } from '@/lib/session'
import { loginSchema } from '@/lib/auth-validation'
import { useAuth } from '@/contexts/AuthContext'
import type { AuthUser } from '@/types/user'
import type { User } from '@/lib/types'

interface LoginScreenProps {
  onLoginSuccess: () => void
  onNavigateToRegister: () => void
  onNavigateToForgotPassword: () => void
}

export function LoginScreen({ 
  onLoginSuccess, 
  onNavigateToRegister,
  onNavigateToForgotPassword 
}: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Rate limiting
  const loginAttempts = useRef<number[]>([])
  const MAX_ATTEMPTS = 3
  const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

  const [users] = useKV<AuthUser[]>('users', [])
  const { login } = useAuth()

  const validateField = (field: string, value: string) => {
    try {
      const formData = { email, password, [field]: value }
      loginSchema.parse(formData)
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    } catch (err) {
      if (err instanceof z.ZodError) {
        const formatted = err.format()
        const fieldError = formatted[field as keyof typeof formatted]
        if (fieldError && '_errors' in fieldError) {
          setErrors(prev => ({ ...prev, [field]: fieldError._errors[0] ?? 'Invalid' }))
        }
      }
    }
  }

  const handleBlur = (field: string) => {
    const value = field === 'email' ? email : password
    validateField(field, value)
  }

  const checkRateLimit = (): boolean => {
    const now = Date.now()
    // Remove old attempts outside the window
    loginAttempts.current = loginAttempts.current.filter(
      timestamp => now - timestamp < RATE_LIMIT_WINDOW
    )

    if (loginAttempts.current.length >= MAX_ATTEMPTS) {
      return false
    }

    loginAttempts.current.push(now)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    try {
      loginSchema.parse({ email, password })
      setErrors({})
    } catch (err) {
      if (err instanceof z.ZodError) {
        const formatted = err.format()
        const newErrors: Record<string, string> = {}
        if (formatted.email && '_errors' in formatted.email) {
          newErrors.email = formatted.email._errors[0] ?? 'Invalid email'
        }
        if (formatted.password && '_errors' in formatted.password) {
          newErrors.password = formatted.password._errors[0] ?? 'Invalid password'
        }
        setErrors(newErrors)
        return
      }
    }

    // Check rate limit
    if (!checkRateLimit()) {
      toast.error('Too many login attempts. Please try again in a minute.')
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate small delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 200))

      // Look up user by email
      const safeUsers = users ?? []
      const user = safeUsers.find(u => u.email === email)

      if (!user) {
        // User not found - return generic error
        setErrors({ password: 'Invalid email or password' })
        setIsSubmitting(false)
        return
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.hashed_password)

      if (!isValidPassword) {
        // Wrong password - return generic error
        setErrors({ password: 'Invalid email or password' })
        setIsSubmitting(false)
        return
      }

      // Generate session token
      const session = generateSessionToken(user.id, user.email, rememberMe ? 7 : 1)

      // Create user profile object
      const userProfile: User = {
        id: user.id,
        email: user.email,
        preferences: {},
        saved: [],
        currency: 'USD',
        language: 'en',
        hasCompletedOnboarding: false,
      }

      // Login via auth context
      login(session, userProfile)

      // Show success message
      toast.success('Welcome back!')

      // Navigate to home
      onLoginSuccess()
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Failed to login. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = email && password && Object.keys(errors).length === 0

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Login to access your trips and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={onNavigateToForgotPassword}
                className="text-sm text-teal-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="text-teal-600 hover:underline font-medium"
              >
                Create Account
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
