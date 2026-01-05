import { useState } from 'react'
import { useKV } from '@github/spark'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { hashPassword, generateUUID } from '@/lib/crypto'
import { sendVerificationEmail } from '@/lib/email'
import { registrationSchema } from '@/lib/validation'
import type { AuthUser, VerificationToken } from '@/types/user'

interface RegisterScreenProps {
  onRegistrationSuccess: () => void
}

export function RegisterScreen({ onRegistrationSuccess }: RegisterScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Store users in Spark KV
  const [users, setUsers] = useKV<AuthUser[]>('users', [])
  const [verificationTokens, setVerificationTokens] = useKV<VerificationToken[]>('verification_tokens', [])

  const validateField = (field: string, value: string) => {
    try {
      const formData = { email, password, confirmPassword, [field]: value }
      registrationSchema.parse(formData)
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldError = err.errors.find(e => e.path[0] === field)
        if (fieldError) {
          setErrors(prev => ({ ...prev, [field]: fieldError.message }))
        }
      }
    }
  }

  const handleBlur = (field: string) => {
    const value = field === 'email' ? email : field === 'password' ? password : confirmPassword
    validateField(field, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    try {
      registrationSchema.parse({ email, password, confirmPassword })
      setErrors({})
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        err.errors.forEach(error => {
          const field = error.path[0] as string
          newErrors[field] = error.message
        })
        setErrors(newErrors)
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Check if user already exists
      const safeUsers = users ?? []
      const existingUser = safeUsers.find(u => u.email === email)
      if (existingUser) {
        setErrors({ email: 'An account with this email already exists' })
        setIsSubmitting(false)
        return
      }

      // Hash password
      const hashedPassword = await hashPassword(password)

      // Create user record
      const newUser: AuthUser = {
        id: generateUUID(),
        email,
        hashed_password: hashedPassword,
        created_at: new Date().toISOString(),
        email_verified: false,
      }

      // Store user
      setUsers([...safeUsers, newUser])

      // Send verification email and store token
      const verificationToken = await sendVerificationEmail(email, newUser.id)
      const safeTokens = verificationTokens ?? []
      setVerificationTokens([...safeTokens, verificationToken])

      // Show success message
      toast.success('Account created!')

      // Navigate to onboarding
      onRegistrationSuccess()
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Failed to create account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = email && password && confirmPassword && Object.keys(errors).length === 0

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create Your Account</CardTitle>
          <CardDescription className="text-center">
            Join Pulau to save your trips and preferences
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
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
