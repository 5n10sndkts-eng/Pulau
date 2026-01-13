import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PremiumContainer } from '@/components/ui/premium-container';
import { toast } from 'sonner';
import { UserCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { User } from '@/lib/types';
import { authService } from '@/lib/authService';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/components/ui/motion.variants';
import { z } from 'zod';

const registrationSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

interface CustomerRegisterProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: (user: User) => void;
}

export function CustomerRegister({
  onNavigateToLogin,
  onRegisterSuccess,
}: CustomerRegisterProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Zod Validation
    const result = registrationSchema.safeParse(formData);
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setIsLoading(true);

    try {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
      const user = await authService.register(
        fullName,
        formData.email,
        formData.password,
        formData.firstName.trim(),
        formData.lastName.trim(),
      );

      // User already has firstName/lastName from authService
      const enhancedUser: User = {
        ...user,
        hasCompletedOnboarding: false,
      };

      toast.success(
        'Welcome to Pulau! Check your email to verify your account.',
      );
      onRegisterSuccess(enhancedUser);
    } catch (error) {
      console.error('Registration error:', error);
      const message =
        error instanceof Error ? error.message : 'Registration failed';
      // Map Supabase error messages to user-friendly ones
      if (message.includes('User already registered')) {
        setAuthError(
          'This email is already registered. Please sign in instead.',
        );
      } else if (message.includes('Password should be at least')) {
        setAuthError('Password must be at least 8 characters.');
      } else {
        setAuthError(message);
      }
      toast.error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <PremiumContainer variant="glass" className="w-full max-w-md p-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >
          <motion.button
            variants={fadeInUp}
            onClick={onNavigateToLogin}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to login
          </motion.button>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col items-center"
          >
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-inner">
              <UserCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2 tracking-tight">
              Create Account
            </h1>
            <p className="text-muted-foreground text-center text-balance">
              Join the future of premium Bali travel planning
            </p>
          </motion.div>

          <motion.form
            variants={fadeInUp}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {authError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{authError}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Kadek"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className={
                    errors.firstName
                      ? 'border-destructive ring-destructive/20'
                      : ''
                  }
                />
                {errors.firstName && (
                  <p className="text-xs font-semibold text-destructive mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Sastra"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className={
                    errors.lastName
                      ? 'border-destructive ring-destructive/20'
                      : ''
                  }
                />
                {errors.lastName && (
                  <p className="text-xs font-semibold text-destructive mt-1">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="bali.explorer@gmail.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={
                  errors.email ? 'border-destructive ring-destructive/20' : ''
                }
              />
              {errors.email && (
                <p className="text-xs font-semibold text-destructive mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={
                  errors.password
                    ? 'border-destructive ring-destructive/20'
                    : ''
                }
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-xs font-semibold text-destructive mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Verify password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange('confirmPassword', e.target.value)
                }
                className={
                  errors.confirmPassword
                    ? 'border-destructive ring-destructive/20'
                    : ''
                }
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="text-xs font-semibold text-destructive mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="premium"
              className="w-full mt-2"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </motion.form>

          <motion.div variants={fadeInUp} className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={onNavigateToLogin}
                className="text-primary hover:underline font-bold"
              >
                Sign in
              </button>
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">
                Secure Authentication
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Your account is protected by Supabase Auth with
                industry-standard encryption. We never store your plain-text
                password.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </PremiumContainer>
    </div>
  );
}
