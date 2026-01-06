import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { UserCircle, Building2 } from 'lucide-react'
import { User } from '@/lib/types'

interface CustomerLoginProps {
  onLoginSuccess: (user: User) => void
  onNavigateToRegister: () => void
  onNavigateToPasswordReset: () => void
  onNavigateToVendor: () => void
}

export function CustomerLogin({ 
  onLoginSuccess, 
  onNavigateToRegister,
  onNavigateToPasswordReset,
  onNavigateToVendor
}: CustomerLoginProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    // Simulate login delay
    setTimeout(() => {
      // Mock login - in production this would call an API
      console.log('Customer login attempt:', {
        email: formData.email,
        password: '[HIDDEN]',
      })
      
      // Create mock authenticated user
      const authenticatedUser: User = {
        id: `user_${Date.now()}`,
        email: formData.email,
        firstName: 'Demo',
        lastName: 'User',
        preferences: {},
        saved: [],
        currency: 'USD',
        language: 'en',
        hasCompletedOnboarding: true, // Set to true since they're logging in
        emailVerified: true,
        createdAt: new Date().toISOString(),
      }
      
      setIsLoading(false)
      toast.success('Welcome back!')
      onLoginSuccess(authenticatedUser)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <UserCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground text-center">
            Sign in to continue planning your Bali adventure
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? 'border-destructive' : ''}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                onClick={onNavigateToPasswordReset}
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={errors.password ? 'border-destructive' : ''}
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Don't have an account?{' '}
            <button
              onClick={onNavigateToRegister}
              className="text-primary hover:underline font-medium"
            >
              Create account
            </button>
          </p>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground">
              OR
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={onNavigateToVendor}
        >
          <Building2 className="h-4 w-4 mr-2" />
          Vendor Portal
        </Button>
      </Card>
    </div>
  )
}
