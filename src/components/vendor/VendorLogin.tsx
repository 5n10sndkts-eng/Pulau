import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { VendorSession } from '@/lib/types';
import { toast } from 'sonner';
import { Building2, LogIn } from 'lucide-react';
import { authService } from '@/lib/authService';
import { vendorService } from '@/lib/vendorService';

interface VendorLoginProps {
  onLogin: (session: VendorSession) => void;
  onNavigateToRegister: () => void;
}

export function VendorLogin({
  onLogin,
  onNavigateToRegister,
}: VendorLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Authenticate User
      const user = await authService.login(email, password);

      if (!user) {
        toast.error('Invalid credentials');
        setIsLoading(false);
        return;
      }

      // 2. Fetch Vendor Profile
      const vendor = await vendorService.getVendorByUserId(user.id);

      if (!vendor) {
        toast.error('No vendor account found for this user');
        setIsLoading(false);
        return;
      }

      if (vendor.status === 'pending_verification') {
        toast.error('Your account is pending verification');
        setIsLoading(false);
        return;
      }

      if (vendor.status === 'suspended') {
        toast.error('Your account has been suspended');
        setIsLoading(false);
        return;
      }

      // 3. Create Session
      const session: VendorSession = {
        vendorId: vendor.id,
        businessName: vendor.businessName,
        verified: vendor.verified,
        role: 'vendor',
      };

      toast.success(`Welcome back, ${vendor.businessName}!`);
      onLogin(session);
    } catch (err) {
      console.error('Login error:', err);
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-center">
            Vendor Portal
          </h1>
          <p className="text-muted-foreground text-center mt-2">
            Sign in to manage your experiences
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Business Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>Signing in...</>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Don't have a vendor account?{' '}
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="text-primary hover:underline font-medium"
            >
              Register your business
            </button>
          </p>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              Demo Credentials:
            </p>
            <p className="text-xs font-mono bg-muted p-2 rounded">
              Email: demo@vendor.pulau
              <br />
              Password: (any password)
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
