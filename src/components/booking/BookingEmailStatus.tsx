/**
 * BookingEmailStatus Component (Story 30-1-4: AC #4)
 *
 * Displays email delivery status for a booking and allows manual resend.
 * Shows: sent, pending, failed states with appropriate actions.
 */

import { useState } from 'react';
import { Mail, CheckCircle, AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface BookingEmailStatusProps {
  bookingId: string;
  emailSent: boolean;
  emailSentAt: string | null;
  emailResendCount?: number;
  /** Compact mode for table rows */
  compact?: boolean;
  /** Callback after successful resend */
  onResendSuccess?: () => void;
}

export type EmailStatus = 'sent' | 'pending' | 'failed';

/**
 * Determine email status from booking data
 */
export function getEmailStatus(
  emailSent: boolean,
  emailSentAt: string | null,
): EmailStatus {
  if (emailSent && emailSentAt) {
    return 'sent';
  }
  // If not sent but booking exists, it's either pending or failed
  // We'd need to check failed_emails table for definitive "failed" status
  return 'pending';
}

export function BookingEmailStatus({
  bookingId,
  emailSent,
  emailSentAt,
  emailResendCount = 0,
  compact = false,
  onResendSuccess,
}: BookingEmailStatusProps) {
  const [isResending, setIsResending] = useState(false);
  const status = getEmailStatus(emailSent, emailSentAt);

  const handleResend = async () => {
    setIsResending(true);
    try {
      const { data, error } = await supabase.functions.invoke('resend-booking-email', {
        body: { booking_id: bookingId },
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast.success('Confirmation email sent successfully');
        onResendSuccess?.();
      } else {
        throw new Error(data?.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email resend error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to resend email',
      );
    } finally {
      setIsResending(false);
    }
  };

  // Format timestamp
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {status === 'sent' ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
            <span className="text-sm text-green-600" aria-label="Email sent">
              Sent
            </span>
          </>
        ) : status === 'failed' ? (
          <>
            <AlertTriangle className="h-4 w-4 text-red-500" aria-hidden="true" />
            <span className="text-sm text-red-600" aria-label="Email failed">
              Failed
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={isResending}
              aria-label="Resend confirmation email"
              className="h-6 px-2"
            >
              {isResending ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
          </>
        ) : (
          <>
            <Clock className="h-4 w-4 text-yellow-500" aria-hidden="true" />
            <span className="text-sm text-yellow-600" aria-label="Email pending">
              Pending
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={isResending}
              aria-label="Send confirmation email"
              className="h-6 px-2"
            >
              {isResending ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <Mail className="h-3 w-3" />
              )}
            </Button>
          </>
        )}
      </div>
    );
  }

  // Full display mode
  return (
    <div
      className="rounded-lg border p-4"
      role="status"
      aria-label={`Email status: ${status}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {status === 'sent' ? (
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" aria-hidden="true" />
          ) : status === 'failed' ? (
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" aria-hidden="true" />
          ) : (
            <Clock className="h-5 w-5 text-yellow-500 mt-0.5" aria-hidden="true" />
          )}
          <div>
            <h4 className="font-medium text-sm">
              {status === 'sent'
                ? 'Confirmation Email Sent'
                : status === 'failed'
                  ? 'Email Delivery Failed'
                  : 'Email Pending'}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {status === 'sent' && emailSentAt
                ? `Delivered on ${formatDate(emailSentAt)}`
                : status === 'failed'
                  ? `${emailResendCount} attempt${emailResendCount === 1 ? '' : 's'} failed. Click to retry.`
                  : 'Confirmation email has not been sent yet.'}
            </p>
          </div>
        </div>

        {status !== 'sent' && (
          <Button
            variant={status === 'failed' ? 'destructive' : 'outline'}
            size="sm"
            onClick={handleResend}
            disabled={isResending}
            aria-label={status === 'failed' ? 'Retry sending email' : 'Send confirmation email'}
          >
            {isResending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" aria-hidden="true" />
                {status === 'failed' ? 'Retry' : 'Send Email'}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default BookingEmailStatus;
