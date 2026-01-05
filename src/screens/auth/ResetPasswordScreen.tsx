import { useState, useEffect } from 'react'
import { useKV } from '@github/spark'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { hashPassword } from '@/lib/crypto'
import { isResetTokenValid } from '@/lib/password-reset'
import { registrationSchema } from '@/lib/validation'
import type { AuthUser } from '@/types/user'
import type { PasswordResetToken } from '@/types/password-reset'
import type { Session } from '@/types/session'

interface ResetPasswordScreenProps {
  token: string
  onResetSuccess: (email: string) => void
}

export function ResetPasswordScreen({ token, onResetSuccess }: ResetPasswordScreenProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')

  const [resetTokens, setResetTokens] = useKV<PasswordResetToken[]>('password_reset_tokens', [])
  const [users, setUsers] = useKV<AuthUser[]>('users', [])
  const [, setSessions] = useKV<Session[]>('active_sessions', [])

  // Validate token on mount
  useEffect(() => {
    const safeTokens = resetTokens ?? []
    const resetToken = safeTokens.find(t => t.token === token)

    if (!resetToken) {
      setIsValidToken(false)
      return
    }

    if (!isResetTokenValid(resetToken)) {
      setIsValidToken(false)
      return
    }

    // Find user to get email
    const safeUsers = users ?? []
    const user = safeUsers.find(u => u.id === resetToken.userId)
    
    if (!user) {
      setIsValidToken(false)
      return
    }

    setUserEmail(user.email)
    setIsValidToken(true)
  }, [token, resetTokens, users])

  const validatePasswords = (): boolean => {
    try {
      registrationSchema.parse({ email: 'dummy@example.com', password, confirmPassword })
      setErrors({})
      return true
    } catch (err) {
      if (err instanceof Error && 'format' in err) {
        const formatted = (err as any).format()
        const newErrors: Record<string, string> = {}
        
        if (formatted.password && '_errors' in formatted.password) {
          newErrors.password = formatted.password._errors[0] ?? 'Invalid password'
        }
        if (formatted.confirmPassword && '_errors' in formatted.confirmPassword) {
          newErrors.confirmPassword = formatted.confirmPassword._errors[0] ?? 'Passwords must match'
        }
        
        setErrors(newErrors)
        return false
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswords()) {
      return
    }

    setIsSubmitting(true)

    try {
      const safeTokens = resetTokens ?? []
      const resetToken = safeTokens.find(t => t.token === token)

      if (!resetToken) {
        toast.error('Invalid or expired reset token')
        setIsSubmitting(false)
        return
      }

      const safeUsers = users ?? []
      const userIndex = safeUsers.findIndex(u => u.id === resetToken.userId)

      if (userIndex === -1) {
        toast.error('User not found')
        setIsSubmitting(false)
        return
      }

      // Hash new password
      const newHashedPassword = await hashPassword(password)

      // Update user password
      const updatedUsers = [...safeUsers]
      updatedUsers[userIndex] = {
        ...updatedUsers[userIndex]!,
        hashed_password: newHashedPassword,
      }
      setUsers(updatedUsers)

      // Delete used token
      const updatedTokens = safeTokens.filter(t => t.token !== token)
      setResetTokens(updatedTokens)

      // Invalidate all sessions for this user (logout everywhere)
      setSessions([])

      // Show success message
      toast.success('Password updated successfully!')

      // Navigate to login with email
      onResetSuccess(userEmail)
    } catch (error) {
      console.error('Password reset error:', error)
      toast.error('Failed to reset password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center">Validating reset token...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-red-600">Invalid Reset Link</CardTitle>
            <CardDescription className="text-center">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => window.location.href = '/forgot-password'}
              variant="outline"
              className="w-full"
            >
              Request New Reset Link
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
          <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password for {userEmail}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={!password || !confirmPassword || isSubmitting}
            >
              {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
