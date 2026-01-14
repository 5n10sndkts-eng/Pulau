import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UseResendEmailReturn {
  resendEmail: (bookingId: string) => Promise<boolean>;
  isResending: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Hook for resending booking confirmation emails (Story 30-1-4)
 * 
 * @example
 * ```tsx
 * const { resendEmail, isResending, error } = useResendEmail();
 * 
 * <Button onClick={() => resendEmail(bookingId)} disabled={isResending}>
 *   Resend Email
 * </Button>
 * ```
 */
export function useResendEmail(): UseResendEmailReturn {
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const resendEmail = useCallback(async (bookingId: string): Promise<boolean> => {
    setIsResending(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        'resend-booking-email',
        {
          body: { booking_id: bookingId }, // Match edge function expected parameter
        },
      );

      if (invokeError) throw invokeError;

      if (data?.error) {
        throw new Error(data.error);
      }

      // Invalidate booking queries to refresh email status
      await queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });

      toast.success('Confirmation email sent successfully!');
      return true;
    } catch (err: unknown) {
      console.error('Failed to resend email:', err);
      const e =
        err instanceof Error ? err : new Error('Unknown error occurred');
      setError(e);
      toast.error(e.message || 'Failed to resend email');
      return false;
    } finally {
      setIsResending(false);
    }
  }, [queryClient]);

  return { resendEmail, isResending, error, reset };
}
