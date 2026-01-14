/**
 * TrustBadge Component
 * Story: 33.4 - Checkout Form Optimization (AC #5)
 *
 * Displays trust signals near payment to increase conversion
 */

import { Shield, CheckCircle, Clock } from 'lucide-react';
import { getCancellationDeadline } from '@/lib/checkoutHelpers';

interface TrustBadgeProps {
  /** Earliest experience date for cancellation calculation */
  experienceDate?: string;
  /** Show free cancellation message */
  showCancellation?: boolean;
  /** Show secure payment message */
  showSecure?: boolean;
  /** Show instant confirmation message */
  showInstant?: boolean;
  /** Custom className */
  className?: string;
}

export function TrustBadge({
  experienceDate,
  showCancellation = true,
  showSecure = true,
  showInstant = false,
  className = '',
}: TrustBadgeProps) {
  const cancellationDeadline = getCancellationDeadline(experienceDate);

  return (
    <div className={`space-y-2 ${className}`}>
      {showCancellation && (
        <div className="flex items-center gap-2 text-sm text-success">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Free Cancellation</strong> until {cancellationDeadline}
          </span>
        </div>
      )}
      
      {showSecure && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4 shrink-0" />
          <span>Secure payment with 256-bit encryption</span>
        </div>
      )}
      
      {showInstant && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 shrink-0" />
          <span>Instant confirmation via email</span>
        </div>
      )}
    </div>
  );
}
