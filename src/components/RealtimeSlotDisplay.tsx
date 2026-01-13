/**
 * RealtimeSlotDisplay Component
 * Story: 25.1 - Implement Supabase Realtime Subscriptions
 * Story: 25.5 - Display Real-Time Slot Availability
 * Phase: 2a - Core Transactional
 *
 * Displays time slots with real-time availability updates.
 * Includes animations, sold-out handling, and connection status indicators.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRealtimeSlots } from '@/hooks/useRealtimeSlots';
import { getAvailableSlots, type ExperienceSlot } from '@/lib/slotService';
import type { SlotChangePayload } from '@/lib/realtimeService';
import { Clock, Users, Zap, WifiOff, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/helpers';
import { cn } from '@/lib/utils';

export interface RealtimeSlotDisplayProps {
  experienceId: string;
  selectedDate: string; // YYYY-MM-DD format
  basePrice: number; // In cents
  onSlotSelect?: (slot: ExperienceSlot) => void;
  selectedSlotId?: string;
}

export function RealtimeSlotDisplay({
  experienceId,
  selectedDate,
  basePrice,
  onSlotSelect,
  selectedSlotId,
}: RealtimeSlotDisplayProps) {
  const [slots, setSlots] = useState<ExperienceSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [animatingSlots, setAnimatingSlots] = useState<Set<string>>(new Set());

  // Handle slot changes from realtime subscription
  const handleSlotChange = useCallback(
    (payload: SlotChangePayload) => {
      const { eventType, new: newSlot, old: oldSlot } = payload;

      if (eventType === 'UPDATE' && newSlot) {
        setSlots((prevSlots) => {
          // Find and update the changed slot
          const slotIndex = prevSlots.findIndex((s) => s.id === newSlot.id);

          if (slotIndex === -1) return prevSlots;

          // Trigger animation for this slot
          setAnimatingSlots((prev) => new Set(prev).add(newSlot.id));
          setTimeout(() => {
            setAnimatingSlots((prev) => {
              const next = new Set(prev);
              next.delete(newSlot.id);
              return next;
            });
          }, 500); // Animation duration + buffer

          // Update the slot
          const updated = [...prevSlots];
          updated[slotIndex] = newSlot as ExperienceSlot;
          return updated;
        });
      } else if (eventType === 'INSERT' && newSlot) {
        // New slot added - only add if it matches our date
        if (newSlot.slot_date === selectedDate) {
          setSlots((prevSlots) => {
            // Avoid duplicates
            if (prevSlots.some((s) => s.id === newSlot.id)) return prevSlots;
            return [...prevSlots, newSlot as ExperienceSlot].sort((a, b) =>
              a.slot_time.localeCompare(b.slot_time),
            );
          });
        }
      } else if (eventType === 'DELETE' && oldSlot) {
        // Slot deleted
        setSlots((prevSlots) => prevSlots.filter((s) => s.id !== oldSlot.id));
      }
    },
    [selectedDate],
  );

  // Subscribe to realtime updates
  const {
    connectionState,
    lastUpdate,
    error: realtimeError,
    isStale,
  } = useRealtimeSlots(experienceId, handleSlotChange, {
    staleThresholdMs: 60000,
  });

  // Load initial slots
  useEffect(() => {
    let isMounted = true;

    const loadSlots = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const { data, error } = await getAvailableSlots(experienceId, {
          startDate: selectedDate,
          endDate: selectedDate,
        });

        if (isMounted) {
          if (error) {
            setLoadError(error);
          } else if (data) {
            setSlots(data);
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load slots';
        if (isMounted) {
          setLoadError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSlots();

    return () => {
      isMounted = false;
    };
  }, [experienceId, selectedDate]);

  // Show loading skeleton
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  // Show load error
  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{loadError}</AlertDescription>
      </Alert>
    );
  }

  // Show empty state
  if (slots.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-sm font-medium">
          No time slots available for this date
        </p>
        <p className="text-xs mt-2">Please try another date</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection status indicator */}
      <AnimatePresence>
        {(connectionState === 'disconnected' ||
          connectionState === 'error' ||
          isStale) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Alert
              variant={connectionState === 'error' ? 'destructive' : 'default'}
            >
              <WifiOff className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {connectionState === 'error' && realtimeError
                  ? `Connection error: ${realtimeError}`
                  : isStale
                    ? 'Data may be outdated - last updated ' +
                      (lastUpdate
                        ? new Date(lastUpdate).toLocaleTimeString()
                        : 'unknown')
                    : 'Real-time updates disconnected'}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slots list */}
      <div className="space-y-3">
        {slots.map((slot) => {
          const isSelected = slot.id === selectedSlotId;
          const isSoldOut = slot.available_count === 0;
          const isBlocked = slot.is_blocked === true;
          const isAvailable = !isSoldOut && !isBlocked;
          const isLowAvailability =
            slot.available_count > 0 && slot.available_count <= 3;
          const isAnimating = animatingSlots.has(slot.id);
          const displayPrice = slot.price_override_amount ?? basePrice;

          return (
            <motion.div
              key={slot.id}
              layout
              initial={false}
              animate={{
                opacity: isAnimating ? [1, 0.7, 1] : 1,
                scale: isAnimating ? [1, 0.98, 1] : 1,
              }}
              transition={{
                duration: 0.3,
                ease: 'easeInOut',
              }}
            >
              <button
                onClick={() =>
                  isAvailable && onSlotSelect && onSlotSelect(slot)
                }
                disabled={!isAvailable}
                className={cn(
                  'w-full p-4 rounded-xl border-2 transition-all duration-200',
                  'flex items-center justify-between',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  isSelected && 'border-primary bg-primary/5 shadow-lg',
                  !isSelected &&
                    isAvailable &&
                    'border-border hover:border-primary/50 hover:bg-accent',
                  !isAvailable && 'border-border bg-muted',
                )}
              >
                {/* Left side - Time and availability */}
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-lg">
                        {slot.slot_time.substring(0, 5)}
                      </span>
                    </div>

                    {/* Availability indicator with animation */}
                    <motion.div
                      className="mt-1 flex items-center gap-2"
                      initial={false}
                      animate={{
                        opacity: isAnimating ? [0.5, 1] : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {isSoldOut ? (
                          'Sold Out'
                        ) : isBlocked ? (
                          'Not Available'
                        ) : (
                          <>
                            <span
                              className={cn(
                                'font-medium',
                                isLowAvailability && 'text-orange-600',
                              )}
                            >
                              {slot.available_count}
                            </span>{' '}
                            spot{slot.available_count !== 1 ? 's' : ''} left
                          </>
                        )}
                      </span>
                    </motion.div>
                  </div>
                </div>

                {/* Right side - Price and badges */}
                <div className="flex items-center gap-3">
                  {/* Badges */}
                  {isLowAvailability && !isSoldOut && (
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-700 border-orange-200"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Limited
                    </Badge>
                  )}
                  {isSoldOut && (
                    <Badge
                      variant="destructive"
                      className="bg-red-100 text-red-700 border-red-200"
                    >
                      Sold Out
                    </Badge>
                  )}
                  {isBlocked && (
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-600"
                    >
                      Blocked
                    </Badge>
                  )}

                  {/* Price */}
                  {isAvailable && (
                    <div className="text-right">
                      <div className="font-display font-bold text-lg">
                        {formatPrice(displayPrice)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        per person
                      </div>
                    </div>
                  )}
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Last update indicator (when connected) */}
      {connectionState === 'connected' && lastUpdate && (
        <p className="text-xs text-center text-muted-foreground">
          Live updates • Last refreshed{' '}
          {new Date(lastUpdate).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
