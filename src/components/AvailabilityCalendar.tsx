import { useState, useEffect, useCallback } from 'react';
import { ExperienceAvailability } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import {
  getAllSlots,
  type ExperienceSlot,
  type DateRange,
} from '@/lib/slotService';
import {
  subscribeToSlotAvailability,
  unsubscribe,
  type SlotChangePayload,
} from '@/lib/realtimeService';

interface AvailabilityCalendarProps {
  experienceId: string;
  onDateSelect?: (
    date: string,
    availability: ExperienceAvailability | null,
  ) => void;
  selectedDate?: string;
}

/**
 * Transform Supabase slots to ExperienceAvailability format
 */
function transformSlotsToAvailability(
  slots: ExperienceSlot[],
  experienceId: string,
): ExperienceAvailability[] {
  // Group slots by date and aggregate availability
  const dateMap = new Map<
    string,
    { total: number; available: number; blocked: boolean }
  >();

  for (const slot of slots) {
    const existing = dateMap.get(slot.slot_date) || {
      total: 0,
      available: 0,
      blocked: true,
    };
    dateMap.set(slot.slot_date, {
      total: existing.total + slot.total_capacity,
      available: existing.available + slot.available_count,
      blocked: existing.blocked && (slot.is_blocked ?? false),
    });
  }

  return Array.from(dateMap.entries()).map(([date, data]) => ({
    id: `${experienceId}-${date}`,
    experienceId: experienceId,
    date,
    slotsTotal: data.total,
    slotsAvailable: data.available,
    status: data.blocked ? 'blocked' : 'available',
  }));
}

export function AvailabilityCalendar({
  experienceId,
  onDateSelect,
  selectedDate,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slots, setSlots] = useState<ExperienceSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Calculate date range for 60-day window
  const getDateRange = useCallback((): DateRange => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 60);

    return {
      startDate: today.toISOString().split('T')[0] ?? '',
      endDate: endDate.toISOString().split('T')[0] ?? '',
    };
  }, []);

  // Fetch slots from Supabase
  useEffect(() => {
    let isMounted = true;

    async function fetchSlots() {
      if (!experienceId) return;

      setLoading(true);
      const dateRange = getDateRange();
      const result = await getAllSlots(experienceId, dateRange);

      if (!isMounted) return;

      if (result.error) {
        toast.error('Failed to load availability', {
          description: result.error,
        });
        setLoading(false);
        return;
      }

      setSlots(result.data || []);
      setLoading(false);
    }

    fetchSlots();

    return () => {
      isMounted = false;
    };
  }, [experienceId, getDateRange]);

  // Subscribe to realtime slot updates
  useEffect(() => {
    if (!experienceId) return;

    const handleSlotChange = (payload: SlotChangePayload) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        setSlots((prev) => [...prev, payload.new as ExperienceSlot]);
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        setSlots((prev) =>
          prev.map((slot) =>
            slot.id === (payload.new as ExperienceSlot).id
              ? (payload.new as ExperienceSlot)
              : slot,
          ),
        );
      } else if (payload.eventType === 'DELETE' && payload.old) {
        setSlots((prev) =>
          prev.filter((slot) => slot.id !== (payload.old as ExperienceSlot).id),
        );
      }
    };

    const subscriptionId = subscribeToSlotAvailability(
      experienceId,
      handleSlotChange,
    );

    // Check if realtime is connected (not disabled)
    setRealtimeConnected(subscriptionId !== 'realtime-disabled');

    return () => {
      if (subscriptionId !== 'realtime-disabled') {
        unsubscribe(subscriptionId);
      }
    };
  }, [experienceId]);

  // Transform slots to availability format
  const safeAvailability = transformSlotsToAvailability(slots, experienceId);

  // Generate calendar for 60 days from today
  const getDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const dates = getDates();

  // Filter dates for current month view
  const getMonthDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    return dates.filter(
      (date) => date.getFullYear() === year && date.getMonth() === month,
    );
  };

  const monthDates = getMonthDates();

  // Get availability for a specific date
  const getAvailabilityForDate = (
    date: Date,
  ): ExperienceAvailability | null => {
    const dateStr = date.toISOString().split('T')[0];
    return safeAvailability.find((a) => a.date === dateStr) || null;
  };

  // Determine status color and label
  const getDateStatus = (availability: ExperienceAvailability | null) => {
    if (!availability || availability.status === 'blocked') {
      return {
        color: 'bg-gray-100 text-gray-400 cursor-not-allowed',
        label: 'Not Operating',
        canSelect: false,
      };
    }

    if (availability.slotsAvailable === 0) {
      return {
        color: 'bg-red-50 text-red-700 cursor-not-allowed',
        label: 'Sold Out',
        canSelect: false,
      };
    }

    const percentage =
      (availability.slotsAvailable / availability.slotsTotal) * 100;

    if (percentage > 50) {
      return {
        color: 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer',
        label: 'Available',
        canSelect: true,
      };
    }

    return {
      color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 cursor-pointer',
      label: 'Limited',
      canSelect: true,
    };
  };

  const handleDateClick = (
    date: Date,
    availability: ExperienceAvailability | null,
  ) => {
    const status = getDateStatus(availability);
    if (status.canSelect && onDateSelect) {
      const dateStr = date.toISOString().split('T')[0] ?? '';
      onDateSelect(dateStr, availability);
    }
  };

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);

    // Don't go before current month
    const today = new Date();
    if (newMonth >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setCurrentMonth(newMonth);
    }
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);

    // Don't go beyond 60 days
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    if (newMonth <= maxDate) {
      setCurrentMonth(newMonth);
    }
  };

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Get day names
  const getDayNames = () => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames;
  };

  // Get first day of month offset
  const getMonthStartOffset = () => {
    if (monthDates.length === 0) return 0;
    return monthDates[0]?.getDay() ?? 0;
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold">Availability</h3>
            {realtimeConnected ? (
              <Wifi className="h-3 w-3 text-green-500" aria-label="Live updates active" />
            ) : (
              <WifiOff className="h-3 w-3 text-muted-foreground" aria-label="Live updates unavailable" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousMonth}
              disabled={currentMonth.getMonth() === new Date().getMonth()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {monthName}
            </span>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-green-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-yellow-500" />
            <span>Limited</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-red-500" />
            <span>Sold Out</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-gray-300" />
            <span>Not Operating</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-7 gap-1">
            {getDayNames().map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        )}

        {/* Calendar Grid */}
        {!loading && (
          <div className="grid grid-cols-7 gap-1">
          {/* Day names */}
          {getDayNames().map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}

          {/* Empty cells for offset */}
          {Array.from({ length: getMonthStartOffset() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Date cells */}
          {monthDates.map((date) => {
            const availability = getAvailabilityForDate(date);
            const status = getDateStatus(availability);
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date, availability)}
                disabled={!status.canSelect}
                className={`
                  aspect-square rounded-lg text-sm font-medium
                  transition-all duration-200
                  flex items-center justify-center
                  ${status.color}
                  ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                `}
                aria-label={`${date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}, ${status.label}${availability ? `, ${availability.slotsAvailable} spots left` : ''}`}
                aria-selected={isSelected}
                role="button"
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
        )}

        {/* Selected date info */}
        {selectedDate && (
          <div className="pt-3 border-t">
            {(() => {
              const selected = dates.find(
                (d) => d.toISOString().split('T')[0] === selectedDate,
              );
              const availability = selected
                ? getAvailabilityForDate(selected)
                : null;

              if (!selected) return null;

              return (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {selected.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    {availability && availability.status === 'available' && (
                      <p className="text-sm text-muted-foreground">
                        {availability.slotsAvailable} spot
                        {availability.slotsAvailable !== 1 ? 's' : ''} left
                      </p>
                    )}
                  </div>
                  {availability && availability.status === 'available' && (
                    <Badge
                      variant={
                        availability.slotsAvailable / availability.slotsTotal >
                        0.5
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {availability.slotsAvailable / availability.slotsTotal >
                      0.5
                        ? 'Available'
                        : 'Limited'}
                    </Badge>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Loading state */}
        {!loading && safeAvailability.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No availability data yet</p>
            <p className="text-xs mt-1">
              The vendor needs to set their availability calendar
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
