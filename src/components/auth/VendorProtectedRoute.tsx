import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { VendorSession } from '@/lib/types';

interface VendorProtectedRouteProps {
  children: React.ReactNode;
  session: VendorSession | null;
  isLoading?: boolean;
}

/**
 * A wrapper component that protects vendor routes from unauthenticated access.
 * If the vendor is not logged in, it redirects them to the vendor login page
 * while preserving the current location in the state to allow
 * redirecting back after a successful login.
 */
export const VendorProtectedRoute: React.FC<VendorProtectedRouteProps> = ({
  children,
  session,
  isLoading = false,
}) => {
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground animate-pulse font-medium">
          Loading vendor session...
        </p>
      </div>
    );
  }

  if (!session) {
    // Redirect to vendor login page but save the current location
    return <Navigate to="/vendor/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
