/**
 * CheckoutSuccess Component Tests
 * Story: 24.3 - Integrate Stripe Checkout for Payment
 *
 * These tests validate the component structure and exports.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('CheckoutSuccess Component', () => {
  const componentPath = resolve(__dirname, './CheckoutSuccess.tsx');
  const componentCode = readFileSync(componentPath, 'utf-8');

  describe('Component Structure', () => {
    it('should export CheckoutSuccess component', () => {
      expect(componentCode).toContain('export function CheckoutSuccess');
    });

    it('should have proper props interface', () => {
      expect(componentCode).toContain('interface CheckoutSuccessProps');
      expect(componentCode).toContain('onNavigateHome: () => void');
      expect(componentCode).toContain('onNavigateToTrips: () => void');
    });

    it('should have SessionStatus interface', () => {
      expect(componentCode).toContain('interface SessionStatus');
      expect(componentCode).toContain('status:');
      expect(componentCode).toContain('bookingReference?:');
    });
  });

  describe('Required Imports', () => {
    it('should import React hooks', () => {
      expect(componentCode).toContain('useEffect');
      expect(componentCode).toContain('useState');
    });

    it('should import useSearchParams for session_id', () => {
      expect(componentCode).toContain('useSearchParams');
      expect(componentCode).toContain("searchParams.get('session_id')");
    });

    it('should import UI components', () => {
      expect(componentCode).toContain("from '@/components/ui/button'");
      expect(componentCode).toContain("from '@/components/ui/card'");
      expect(componentCode).toContain("from '@/components/ui/skeleton'");
      expect(componentCode).toContain("from '@/components/ui/alert'");
    });

    it('should import supabase', () => {
      expect(componentCode).toContain("from '@/lib/supabase'");
      expect(componentCode).toContain('isSupabaseConfigured');
    });

    it('should import lucide-react icons', () => {
      expect(componentCode).toContain("from 'lucide-react'");
      expect(componentCode).toContain('CheckCircle2');
      expect(componentCode).toContain('Loader2');
      expect(componentCode).toContain('AlertCircle');
    });
  });

  describe('Session Verification', () => {
    it('should handle missing session ID', () => {
      expect(componentCode).toContain('No session ID provided');
    });

    it('should poll for booking confirmation', () => {
      expect(componentCode).toContain('pollForBooking');
      expect(componentCode).toContain('maxAttempts');
      expect(componentCode).toContain('pollInterval');
    });

    it('should query payments table with booking relation', () => {
      expect(componentCode).toContain("from('payments')");
      expect(componentCode).toContain('stripe_checkout_session_id');
      expect(componentCode).toContain('bookings!inner');
    });
  });

  describe('Loading States', () => {
    it('should show loading state', () => {
      expect(componentCode).toContain("status === 'loading'");
      expect(componentCode).toContain('Verifying Payment');
    });

    it('should show pending state', () => {
      expect(componentCode).toContain("status === 'pending'");
      expect(componentCode).toContain('Confirming Your Booking');
    });
  });

  describe('Error Handling', () => {
    it('should show error state', () => {
      expect(componentCode).toContain("status === 'error'");
      expect(componentCode).toContain('Something Went Wrong');
    });

    it('should display session ID for support', () => {
      expect(componentCode).toContain('sessionId?.slice');
    });
  });

  describe('Success State', () => {
    it('should show success message', () => {
      expect(componentCode).toContain('Payment Successful');
    });

    it('should display booking reference', () => {
      expect(componentCode).toContain('Booking Reference');
      expect(componentCode).toContain('sessionStatus.bookingReference');
    });

    it('should have navigation buttons', () => {
      expect(componentCode).toContain('View My Bookings');
      expect(componentCode).toContain('Continue Exploring');
      expect(componentCode).toContain('onNavigateToTrips');
      expect(componentCode).toContain('onNavigateHome');
    });
  });

  describe('Demo Mode Support', () => {
    it('should handle demo mode without Supabase', () => {
      expect(componentCode).toContain('isSupabaseConfigured()');
      expect(componentCode).toContain('Simulate demo booking reference');
    });
  });
});

describe('CheckoutCancel Component', () => {
  const componentPath = resolve(__dirname, './CheckoutCancel.tsx');
  const componentCode = readFileSync(componentPath, 'utf-8');

  describe('Component Structure', () => {
    it('should export CheckoutCancel component', () => {
      expect(componentCode).toContain('export function CheckoutCancel');
    });

    it('should have proper props interface', () => {
      expect(componentCode).toContain('interface CheckoutCancelProps');
      expect(componentCode).toContain('onRetryCheckout: () => void');
      expect(componentCode).toContain('onReturnToTrip: () => void');
      expect(componentCode).toContain('onNavigateHome: () => void');
    });
  });

  describe('Required Imports', () => {
    it('should import UI components', () => {
      expect(componentCode).toContain("from '@/components/ui/button'");
      expect(componentCode).toContain("from '@/components/ui/card'");
      expect(componentCode).toContain("from '@/components/ui/alert'");
    });

    it('should import lucide-react icons', () => {
      expect(componentCode).toContain("from 'lucide-react'");
      expect(componentCode).toContain('XCircle');
      expect(componentCode).toContain('ArrowLeft');
      expect(componentCode).toContain('RefreshCw');
    });
  });

  describe('User Messaging', () => {
    it('should show cancellation message', () => {
      expect(componentCode).toContain('Payment Cancelled');
      expect(componentCode).toContain('no charges were made');
    });

    it('should explain why payment was cancelled', () => {
      expect(componentCode).toContain('Why was my payment cancelled');
      expect(componentCode).toContain('clicked "Back"');
      expect(componentCode).toContain('session may have expired');
    });
  });

  describe('Navigation Options', () => {
    it('should have Try Again button', () => {
      expect(componentCode).toContain('Try Again');
      expect(componentCode).toContain('onRetryCheckout');
    });

    it('should have Return to Cart button', () => {
      expect(componentCode).toContain('Return to Cart');
      expect(componentCode).toContain('onReturnToTrip');
    });

    it('should have Continue Browsing option', () => {
      expect(componentCode).toContain('Continue Browsing');
      expect(componentCode).toContain('onNavigateHome');
    });
  });

  describe('Support Contact', () => {
    it('should show support email', () => {
      expect(componentCode).toContain('support@pulau.travel');
    });
  });
});
