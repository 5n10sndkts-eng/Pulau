import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserCircle, Building2 } from 'lucide-react';
import { User } from '@/lib/types';
import { authService } from '@/lib/authService';

interface CustomerLoginProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToRegister: () => void;
  onNavigateToPasswordReset: () => void;
  onNavigateToVendor: () => void;
  onGuestEntry: () => void;
}

export function CustomerLogin({
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateToPasswordReset,
  onNavigateToVendor,
  onGuestEntry,
}: CustomerLoginProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const user = await authService.login(formData.email, formData.password);
      toast.success('Welcome back!');
      onLoginSuccess(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      // Map Supabase error messages to user-friendly ones
      if (message.includes('Invalid login credentials')) {
        setAuthError('Invalid email or password. Please try again.');
      } else if (message.includes('Email not confirmed')) {
        setAuthError('Please verify your email address before signing in.');
      } else {
        setAuthError(message);
      }
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

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
          {authError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{authError}</p>
            </div>
          )}

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

          <Button type="submit" className="w-full" disabled={isLoading}>
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
            <span className="bg-background px-2 text-muted-foreground">OR</span>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full h-auto py-4 border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 group"
            onClick={onGuestEntry}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-semibold text-lg text-primary group-hover:text-primary transition-colors">
                Build Your Dream Vacation
              </span>
              <span className="text-xs text-muted-foreground">
                No account needed • Try it now
              </span>
            </div>
          </Button>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={onNavigateToVendor}
          >
            <Building2 className="h-4 w-4 mr-2" />
            Vendor Portal
          </Button>
        </div>
      </Card>
    </div>
  );
}
