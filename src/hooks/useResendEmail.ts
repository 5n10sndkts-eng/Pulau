
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UseResendEmailReturn {
    resendEmail: (bookingId: string) => Promise<boolean>;
    isResending: boolean;
    error: Error | null;
}

export function useResendEmail(): UseResendEmailReturn {
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const resendEmail = async (bookingId: string): Promise<boolean> => {
        setIsResending(true);
        setError(null);

        try {
            const { data, error: invokeError } = await supabase.functions.invoke('resend-booking-email', {
                body: { bookingId }
            });

            if (invokeError) throw invokeError;

            // Also check 200 OK but application level error if needed, 
            // typically invoke throws on non-2xx if configured? 
            // Supabase invoke usually returns data/error.

            if (data?.error) {
                throw new Error(data.error);
            }

            toast.success('Email resent successfully!');
            return true;
        } catch (err: any) {
            console.error('Failed to resend email:', err);
            const e = err instanceof Error ? err : new Error('Unknown error occurred');
            setError(e);
            toast.error(e.message || 'Failed to resend email');
            return false;
        } finally {
            setIsResending(false);
        }
    };

    return { resendEmail, isResending, error };
}
