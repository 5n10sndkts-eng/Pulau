/**
 * Perfect For You Badge Component
 * Epic 4, Story 4.4: Personalized Recommendations
 */

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerfectForYouBadgeProps {
  className?: string;
}

export function PerfectForYouBadge({ className }: PerfectForYouBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-coral-500 to-coral-600 px-3 py-1 text-xs font-semibold text-white shadow-sm',
        className,
      )}
    >
      <Star className="h-3.5 w-3.5 fill-current" />
      Perfect for you
    </div>
  );
}
