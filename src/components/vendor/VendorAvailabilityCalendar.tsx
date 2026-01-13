/**
 * Vendor Availability Calendar
 * Story: 23.1 - Build Slot Creation Interface
 * Phase: 2a - Core Transactional
 *
 * Calendar view for managing experience time slots with support for:
 * - Time-based slots (date + time)
 * - Capacity management
 * - Price overrides
 * - Recurring slot creation
 * - Block/unblock functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Minus,
  Clock,
  Users,
  DollarSign,
  Loader2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  slotService,
  type ExperienceSlot,
  type SlotCreateInput,
  type DateRange,
} from '@/lib/slotService';

interface VendorAvailabilityCalendarProps {
  experienceId: string;
  experienceBasePrice?: number; // In cents
  onBack: () => void;
}

// Time options for slot creation (30-min intervals)
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? '00' : '30';
  const time = `${hours.toString().padStart(2, '0')}:${minutes}`;
  const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString(
    'en-US',
    {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    },
  );
  return { value: time, label: displayTime };
});

// Duration options in minutes
const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
  { value: 240, label: '4 hours' },
  { value: 360, label: '6 hours' },
  { value: 480, label: '8 hours (Full day)' },
];

export function VendorAvailabilityCalendar({
  experienceId,
  experienceBasePrice = 0,
  onBack,
}: VendorAvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slots, setSlots] = useState<ExperienceSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ExperienceSlot | null>(null);

  // Slot creation state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTime, setCreateTime] = useState('09:00');
  const [createDuration, setCreateDuration] = useState(120); // Display-only: used to show end time, not stored in DB
  const [createCapacity, setCreateCapacity] = useState(10);
  const [createPriceOverride, setCreatePriceOverride] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  // Slot detail/edit state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editCapacity, setEditCapacity] = useState(10);
  const [editBlocked, setEditBlocked] = useState(false);
  const [editBlockReason, setEditBlockReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Recurring slot state
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [recurringDays, setRecurringDays] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [recurringTime, setRecurringTime] = useState('09:00');
  const [recurringCapacity, setRecurringCapacity] = useState(10);
  const [recurringStartDate, setRecurringStartDate] = useState('');
  const [recurringEndDate, setRecurringEndDate] = useState('');
  const [isCreatingRecurring, setIsCreatingRecurring] = useState(false);

  // Calculate date range for current month view
  const getDateRange = useCallback((): DateRange => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      startDate: firstDay.toISOString().split('T')[0] ?? '',
      endDate: lastDay.toISOString().split('T')[0] ?? '',
    };
  }, [currentMonth]);

  // Load slots for current month
  const loadSlots = useCallback(async () => {
    setIsLoading(true);
    try {
      const dateRange = getDateRange();
      const { data, error } = await slotService.getAllSlots(
        experienceId,
        dateRange,
      );
      if (error) {
        console.error('Failed to load slots:', error);
        toast.error('Failed to load availability data');
        setSlots([]);
      } else {
        setSlots(data || []);
      }
    } catch (error) {
      console.error('Failed to load slots:', error);
      toast.error('Failed to load availability data');
    } finally {
      setIsLoading(false);
    }
  }, [experienceId, getDateRange]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  // Generate month dates for calendar
  const getMonthDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    const dates: Date[] = [];
    for (let d = 1; d <= lastDay.getDate(); d++) {
      dates.push(new Date(year, month, d));
    }
    return dates;
  };

  const monthDates = getMonthDates();

  // Get slots for a specific date
  const getSlotsForDate = (date: Date): ExperienceSlot[] => {
    const dateStr = date.toISOString().split('T')[0];
    return slots.filter((s) => s.slot_date === dateStr);
  };

  // Get date status for calendar coloring
  const getDateStatus = (
    date: Date,
  ): 'empty' | 'available' | 'partial' | 'blocked' | 'past' => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return 'past';

    const dateSlots = getSlotsForDate(date);
    if (dateSlots.length === 0) return 'empty';

    const allBlocked = dateSlots.every((s) => s.is_blocked);
    if (allBlocked) return 'blocked';

    const hasAvailable = dateSlots.some(
      (s) => !s.is_blocked && s.available_count > 0,
    );
    return hasAvailable ? 'available' : 'partial';
  };

  const getDateColorClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
      case 'blocked':
        return 'bg-gray-200 text-gray-600 hover:bg-gray-300';
      case 'past':
        return 'bg-gray-100 text-gray-400 cursor-not-allowed';
      default:
        return 'bg-white hover:bg-gray-50 border border-gray-200';
    }
  };

  // Handle date click - show slots for that date
  const handleDateClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      toast.error('Cannot modify past dates');
      return;
    }

    const dateStr = date.toISOString().split('T')[0]!;
    setSelectedDate(dateStr);
    setShowCreateModal(true);
  };

  // Handle slot click - show slot detail
  const handleSlotClick = (slot: ExperienceSlot, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSlot(slot);
    setEditCapacity(slot.total_capacity);
    setEditBlocked(slot.is_blocked ?? false);
    setEditBlockReason('');
    setShowDetailModal(true);
  };

  // Create new slot
  const handleCreateSlot = async () => {
    if (!selectedDate) return;

    setIsCreating(true);
    try {
      const input: SlotCreateInput = {
        experienceId,
        slotDate: selectedDate,
        slotTime: createTime,
        totalCapacity: createCapacity,
        priceOverrideAmount: createPriceOverride
          ? Math.round(parseFloat(createPriceOverride) * 100)
          : null,
      };

      const { data, error } = await slotService.createSlot(input);
      if (data) {
        toast.success('Slot created successfully');
        setShowCreateModal(false);
        loadSlots();
      } else {
        toast.error(error || 'Failed to create slot');
      }
    } catch (error) {
      console.error('Create slot error:', error);
      toast.error('Failed to create slot');
    } finally {
      setIsCreating(false);
    }
  };

  // Update slot (capacity, block status)
  const handleUpdateSlot = async () => {
    if (!selectedSlot) return;

    setIsUpdating(true);
    try {
      if (editBlocked !== selectedSlot.is_blocked) {
        // Toggle block status
        const { data, error } = editBlocked
          ? await slotService.blockSlot(
              selectedSlot.id,
              editBlockReason || undefined,
            )
          : await slotService.unblockSlot(selectedSlot.id);

        if (!data) {
          toast.error(error || 'Failed to update slot');
          return;
        }
      }

      if (editCapacity !== selectedSlot.total_capacity) {
        const { data, error } = await slotService.updateSlot(selectedSlot.id, {
          totalCapacity: editCapacity,
          availableCount: Math.min(selectedSlot.available_count, editCapacity),
        });
        if (!data) {
          toast.error(error || 'Failed to update capacity');
          return;
        }
      }

      toast.success('Slot updated successfully');
      setShowDetailModal(false);
      loadSlots();
    } catch (error) {
      console.error('Update slot error:', error);
      toast.error('Failed to update slot');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete slot
  const handleDeleteSlot = async () => {
    if (!selectedSlot) return;

    if (selectedSlot.available_count < selectedSlot.total_capacity) {
      toast.error('Cannot delete slot with existing bookings');
      return;
    }

    setIsUpdating(true);
    try {
      const { data, error } = await slotService.deleteSlot(selectedSlot.id);
      if (data) {
        toast.success('Slot deleted');
        setShowDetailModal(false);
        loadSlots();
      } else {
        toast.error(error || 'Failed to delete slot');
      }
    } catch (error) {
      console.error('Delete slot error:', error);
      toast.error('Failed to delete slot');
    } finally {
      setIsUpdating(false);
    }
  };

  // Create recurring slots
  const handleCreateRecurring = async () => {
    if (!recurringStartDate || !recurringEndDate) {
      toast.error('Please select start and end dates');
      return;
    }

    if (!recurringDays.some((d) => d)) {
      toast.error('Please select at least one day of the week');
      return;
    }

    setIsCreatingRecurring(true);
    try {
      const inputs: SlotCreateInput[] = [];
      const start = new Date(recurringStartDate);
      const end = new Date(recurringEndDate);
      const current = new Date(start);

      while (current <= end) {
        const dayOfWeek = current.getDay();
        if (recurringDays[dayOfWeek]) {
          const dateStr = current.toISOString().split('T')[0]!;
          inputs.push({
            experienceId,
            slotDate: dateStr,
            slotTime: recurringTime,
            totalCapacity: recurringCapacity,
          });
        }
        current.setDate(current.getDate() + 1);
      }

      if (inputs.length === 0) {
        toast.error('No dates match the selected criteria');
        return;
      }

      const result = await slotService.createBulkSlots(inputs);
      if (result.success) {
        toast.success(`Created ${result.created} slots`);
        setShowRecurringModal(false);
        loadSlots();
      } else {
        toast.warning(
          `Created ${result.created} slots, ${result.failed} failed`,
        );
        if (result.errors.length > 0) {
          console.error('Recurring slot errors:', result.errors);
        }
        loadSlots();
      }
    } catch (error) {
      console.error('Create recurring error:', error);
      toast.error('Failed to create recurring slots');
    } finally {
      setIsCreatingRecurring(false);
    }
  };

  // Navigation
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    // Don't go before current month
    const now = new Date();
    if (
      newMonth.getFullYear() > now.getFullYear() ||
      (newMonth.getFullYear() === now.getFullYear() &&
        newMonth.getMonth() >= now.getMonth())
    ) {
      setCurrentMonth(newMonth);
    }
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    // Limit to 12 months from now
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 12);
    if (newMonth <= maxDate) {
      setCurrentMonth(newMonth);
    }
  };

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullDayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const getMonthStartOffset = () => {
    if (monthDates.length === 0) return 0;
    return monthDates[0]?.getDay() ?? 0;
  };

  // Format time for display
  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Calculate end time from start + duration
  const getEndTime = (startTime: string, durationMinutes: number) => {
    const parts = startTime.split(':').map(Number);
    const hours = parts[0] ?? 0;
    const minutes = parts[1] ?? 0;
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + durationMinutes;
    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Experiences
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold">
              Manage Availability
            </h1>
            <p className="text-white/80 mt-1">
              Create and manage time slots for your experience
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-display text-xl font-semibold min-w-[200px] text-center">
                  {monthName}
                </span>
                <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={() => setShowRecurringModal(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Set Recurring
              </Button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-green-100" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-yellow-100" />
                <span>Limited/Sold Out</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-gray-200" />
                <span>Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border border-gray-200" />
                <span>No Slots</span>
              </div>
            </div>

            {/* Calendar */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {/* Day names */}
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}

                {/* Empty cells */}
                {Array.from({ length: getMonthStartOffset() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Date cells */}
                {monthDates.map((date) => {
                  const status = getDateStatus(date);
                  const dateSlots = getSlotsForDate(date);
                  const colorClass = getDateColorClass(status);

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleDateClick(date)}
                      disabled={status === 'past'}
                      className={`
                        min-h-[80px] rounded-lg text-sm font-medium
                        transition-all duration-200
                        flex flex-col items-center p-2
                        ${colorClass}
                      `}
                    >
                      <span className="font-semibold">{date.getDate()}</span>
                      {dateSlots.length > 0 && (
                        <div className="mt-1 space-y-0.5 w-full">
                          {dateSlots.slice(0, 3).map((slot) => (
                            <div
                              key={slot.id}
                              onClick={(e) => handleSlotClick(slot, e)}
                              className={`
                                text-xs px-1 py-0.5 rounded truncate cursor-pointer
                                ${
                                  slot.is_blocked
                                    ? 'bg-gray-300 text-gray-600'
                                    : slot.available_count === 0
                                      ? 'bg-red-200 text-red-700'
                                      : 'bg-white/50 text-inherit'
                                }
                              `}
                            >
                              {formatTime(slot.slot_time)}
                            </div>
                          ))}
                          {dateSlots.length > 3 && (
                            <div className="text-xs text-center opacity-70">
                              +{dateSlots.length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Create Slot Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Time Slot -{' '}
              {selectedDate &&
                new Date(selectedDate + 'T00:00:00').toLocaleDateString(
                  'en-US',
                  {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  },
                )}
            </DialogTitle>
            <DialogDescription>
              Create a new availability slot for this date
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Time Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Start Time
              </Label>
              <Select value={createTime} onValueChange={setCreateTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {TIME_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select
                value={createDuration.toString()}
                onValueChange={(v) => setCreateDuration(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Ends at {formatTime(getEndTime(createTime, createDuration))}
              </p>
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Capacity (guests)
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCreateCapacity(Math.max(1, createCapacity - 1))
                  }
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={createCapacity}
                  onChange={(e) =>
                    setCreateCapacity(
                      Math.max(1, parseInt(e.target.value) || 1),
                    )
                  }
                  className="text-center w-20"
                  min="1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCreateCapacity(createCapacity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Price Override */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Price Override (optional)
              </Label>
              <Input
                type="number"
                placeholder={
                  experienceBasePrice > 0
                    ? `Default: $${(experienceBasePrice / 100).toFixed(2)}`
                    : 'Set custom price'
                }
                value={createPriceOverride}
                onChange={(e) => setCreatePriceOverride(e.target.value)}
                min="0"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use experience base price
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSlot} disabled={isCreating}>
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Slot Detail/Edit Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Slot Details -{' '}
              {selectedSlot && formatTime(selectedSlot.slot_time)}
            </DialogTitle>
            <DialogDescription>
              {selectedSlot &&
                new Date(
                  selectedSlot.slot_date + 'T00:00:00',
                ).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
            </DialogDescription>
          </DialogHeader>

          {selectedSlot && (
            <div className="space-y-4 py-4">
              {/* Current Status */}
              <div className="bg-muted p-3 rounded-lg space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Available
                  </span>
                  <span className="font-medium">
                    {selectedSlot.available_count} /{' '}
                    {selectedSlot.total_capacity}
                  </span>
                </div>
                {selectedSlot.available_count < selectedSlot.total_capacity && (
                  <p className="text-xs text-orange-600">
                    {selectedSlot.total_capacity - selectedSlot.available_count}{' '}
                    booked
                  </p>
                )}
              </div>

              {/* Block Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="blocked">Block this slot</Label>
                <Switch
                  id="blocked"
                  checked={editBlocked}
                  onCheckedChange={setEditBlocked}
                />
              </div>

              {editBlocked && (
                <div className="space-y-2">
                  <Label htmlFor="reason">Block reason (internal)</Label>
                  <Input
                    id="reason"
                    placeholder="e.g., Personal day, Weather"
                    value={editBlockReason}
                    onChange={(e) => setEditBlockReason(e.target.value)}
                  />
                </div>
              )}

              {!editBlocked && (
                <div className="space-y-2">
                  <Label htmlFor="capacity">Total Capacity</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setEditCapacity(Math.max(1, editCapacity - 1))
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="capacity"
                      type="number"
                      value={editCapacity}
                      onChange={(e) =>
                        setEditCapacity(
                          Math.max(1, parseInt(e.target.value) || 1),
                        )
                      }
                      className="text-center w-20"
                      min="1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditCapacity(editCapacity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {editCapacity <
                    selectedSlot.total_capacity -
                      selectedSlot.available_count && (
                    <p className="text-xs text-red-600">
                      Cannot reduce below booked count (
                      {selectedSlot.total_capacity -
                        selectedSlot.available_count}
                      )
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSlot}
              disabled={
                isUpdating ||
                (selectedSlot?.available_count ?? 0) <
                  (selectedSlot?.total_capacity ?? 0)
              }
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateSlot} disabled={isUpdating}>
                {isUpdating && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recurring Availability Modal */}
      <Dialog open={showRecurringModal} onOpenChange={setShowRecurringModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Recurring Availability</DialogTitle>
            <DialogDescription>
              Create slots for multiple dates at once
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Days of Week */}
            <div className="space-y-2">
              <Label>Days of Week</Label>
              <div className="space-y-2">
                {fullDayNames.map((day, index) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${index}`}
                      checked={recurringDays[index]}
                      onCheckedChange={(checked) => {
                        const newDays = [...recurringDays];
                        newDays[index] = checked as boolean;
                        setRecurringDays(newDays);
                      }}
                    />
                    <label
                      htmlFor={`day-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Select value={recurringTime} onValueChange={setRecurringTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {TIME_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <Label>Guests Per Slot</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setRecurringCapacity(Math.max(1, recurringCapacity - 1))
                  }
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={recurringCapacity}
                  onChange={(e) =>
                    setRecurringCapacity(
                      Math.max(1, parseInt(e.target.value) || 1),
                    )
                  }
                  className="text-center w-20"
                  min="1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setRecurringCapacity(recurringCapacity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={recurringStartDate}
                  onChange={(e) => setRecurringStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={recurringEndDate}
                  onChange={(e) => setRecurringEndDate(e.target.value)}
                  min={
                    recurringStartDate || new Date().toISOString().split('T')[0]
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRecurringModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRecurring}
              disabled={isCreatingRecurring}
            >
              {isCreatingRecurring && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Create Slots
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
