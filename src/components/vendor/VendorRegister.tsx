import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, ArrowLeft, CheckCircle } from 'lucide-react';

interface VendorRegisterProps {
  onNavigateToLogin: () => void;
}

export function VendorRegister({ onNavigateToLogin }: VendorRegisterProps) {
  const [formData, setFormData] = useState({
    businessName: '',
    businessEmail: '',
    ownerFirstName: '',
    ownerLastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    // Simulate registration delay
    setTimeout(() => {
      // Mock vendor registration
      console.log('New vendor registration:', formData);

      setIsLoading(false);
      setIsSubmitted(true);
      toast.success('Registration received!');
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">
              Registration Received!
            </h1>
            <p className="text-muted-foreground mb-6">
              Thank you for registering your business with Pulau. Your account
              is awaiting approval.
            </p>
            <div className="bg-muted p-4 rounded-lg mb-6 text-sm text-left w-full">
              <h3 className="font-semibold mb-2">What happens next?</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ We'll review your business details</li>
                <li>✓ Admin will verify your information</li>
                <li>✓ You'll receive a verification email</li>
                <li>✓ Once approved, you can start listing experiences</li>
              </ul>
            </div>
            <Button onClick={onNavigateToLogin} className="w-full">
              Return to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <button
          onClick={onNavigateToLogin}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to login
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-center">
            Register Your Business
          </h1>
          <p className="text-muted-foreground text-center mt-2">
            Join Pulau and start offering experiences to travelers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Business Information</h3>

            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                type="text"
                placeholder="Your Business Name"
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessEmail">Business Email *</Label>
              <Input
                id="businessEmail"
                type="email"
                placeholder="business@example.com"
                value={formData.businessEmail}
                onChange={(e) => handleChange('businessEmail', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+62 812-3456-7890"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Owner Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerFirstName">First Name *</Label>
                <Input
                  id="ownerFirstName"
                  type="text"
                  placeholder="First name"
                  value={formData.ownerFirstName}
                  onChange={(e) =>
                    handleChange('ownerFirstName', e.target.value)
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerLastName">Last Name *</Label>
                <Input
                  id="ownerLastName"
                  type="text"
                  placeholder="Last name"
                  value={formData.ownerLastName}
                  onChange={(e) =>
                    handleChange('ownerLastName', e.target.value)
                  }
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Security</h3>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange('confirmPassword', e.target.value)
                }
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Register Business'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By registering, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
      </Card>
    </div>
  );
}
