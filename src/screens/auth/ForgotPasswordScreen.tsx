import { useState } from 'react'
import { useKV } from '@github/spark'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { generateResetToken } from '@/lib/password-reset'
import type { AuthUser } from '@/types/user'
import type { PasswordResetToken } from '@/types/password-reset'

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void
}

const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
})

export function ForgotPasswordScreen({ onBackToLogin }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const [users] = useKV<AuthUser[]>('users', [])
  const [resetTokens, setResetTokens] = useKV<PasswordResetToken[]>('password_reset_tokens', [])

  const validateEmail = () => {
    try {
      emailSchema.parse({ email })
      setErrors({})
      return true
    } catch (err) {
      if (err instanceof z.ZodError) {
        const formatted = err.format()
        if (formatted.email && '_errors' in formatted.email) {
          setErrors({ email: formatted.email._errors[0] ?? 'Invalid email' })
        }
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Look up user by email
      const safeUsers = users ?? []
      const user = safeUsers.find(u => u.email === email)

      if (user) {
        // Generate reset token
        const resetToken = generateResetToken(user.id, email)
        
        // Store token
        const safeTokens = resetTokens ?? []
        setResetTokens([...safeTokens, resetToken])
      }

      // Always show success message (even if user not found) to prevent enumeration
      setEmailSent(true)
      toast.success('Reset link sent! Check your email.')
    } catch (error) {
      console.error('Password reset error:', error)
      toast.error('Failed to send reset email. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
            <CardDescription className="text-center">
              If an account exists for {email}, you'll receive a password reset link shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={onBackToLogin}
              variant="outline"
              className="w-full"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Forgot Password?</CardTitle>
          <CardDescription className="text-center">
            Enter your email and we'll send you a reset link
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
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={!email || isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-sm text-teal-600 hover:underline"
              >
                Back to Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
