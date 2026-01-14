/**
 * TripTimeline Component
 * Story: DEF-003 - Trip Timeline Missing Connecting Lines
 *
 * Displays a visual timeline with connecting lines between day cards
 * per PRD specification for "custom trip timeline component".
 */

import { cn } from '@/lib/utils';
import { TripItem, Trip } from '@/lib/types';
import { motion } from 'framer-motion';

interface TripTimelineProps {
  children: React.ReactNode;
  showTimeline?: boolean;
}

interface TimelineNodeProps {
  dayNumber: number;
  hasItems: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  children: React.ReactNode;
}

/**
 * Timeline container with vertical connecting line
 */
export function TripTimeline({ children, showTimeline = true }: TripTimelineProps) {
  if (!showTimeline) {
    return <div className="space-y-6">{children}</div>;
  }

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div
        className="absolute left-4 top-6 bottom-6 w-0.5 bg-primary/20"
        aria-hidden="true"
      />
      <div className="space-y-0">{children}</div>
    </div>
  );
}

/**
 * Individual day node on the timeline
 */
export function TimelineNode({
  dayNumber,
  hasItems,
  isFirst = false,
  isLast = false,
  children,
}: TimelineNodeProps) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: dayNumber * 0.05 }}
    >
      {/* Timeline node indicator */}
      <div className="absolute left-0 top-0 flex items-center" style={{ height: '40px' }}>
        <div
          className={cn(
            'w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold z-10',
            hasItems
              ? 'bg-primary border-primary text-primary-foreground'
              : 'bg-background border-primary/40 text-primary/60',
          )}
          aria-label={`Day ${dayNumber}${hasItems ? ', has activities' : ', no activities'}`}
        >
          {dayNumber}
        </div>
      </div>

      {/* Content with left padding for timeline */}
      <div className="pl-12 pb-6">{children}</div>
    </motion.div>
  );
}

/**
 * Simplified timeline for mobile view
 */
export function TimelineMobile({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* Thinner line for mobile */}
      <div
        className="absolute left-2 top-4 bottom-4 w-px bg-primary/20"
        aria-hidden="true"
      />
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/**
 * Mobile timeline node
 */
export function TimelineNodeMobile({
  dayNumber,
  hasItems,
  children,
}: Omit<TimelineNodeProps, 'isFirst' | 'isLast'>) {
  return (
    <div className="relative">
      {/* Smaller node for mobile */}
      <div className="absolute left-0 top-1" style={{ height: '24px' }}>
        <div
          className={cn(
            'w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] font-bold z-10',
            hasItems
              ? 'bg-primary border-primary text-primary-foreground'
              : 'bg-background border-primary/40',
          )}
          aria-label={`Day ${dayNumber}`}
        />
      </div>

      {/* Content */}
      <div className="pl-8">{children}</div>
    </div>
  );
}

export default TripTimeline;
