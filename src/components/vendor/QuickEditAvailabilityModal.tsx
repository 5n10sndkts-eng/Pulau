import { useState, useEffect, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { ExperienceAvailability, Booking } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Minus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface QuickEditAvailabilityModalProps {
  experienceId: string;
  selectedDate: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickEditAvailabilityModal({
  experienceId,
  selectedDate,
  isOpen,
  onClose,
}: QuickEditAvailabilityModalProps) {
  const [availabilityData, setAvailabilityData] = useKV<
    ExperienceAvailability[]
  >(`availability:${experienceId}`, []);
  const [bookingsData] = useKV<Booking[]>('pulau_bookings', []);

  const [slots, setSlots] = useState(10);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [conflictingBookings, setConflictingBookings] = useState<Booking[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const safeAvailability = useMemo(
    () => availabilityData || [],
    [availabilityData],
  );
  const safeBookings = useMemo(() => bookingsData || [], [bookingsData]);

  useEffect(() => {
    if (selectedDate && isOpen) {
      // Load current availability for this date
      const existing = safeAvailability.find((a) => a.date === selectedDate);
      if (existing) {
        setSlots(existing.slotsTotal);
        setIsBlocked(existing.status === 'blocked');
      } else {
        setSlots(10);
        setIsBlocked(false);
      }
      setShowConflictWarning(false);
    }
  }, [selectedDate, isOpen, safeAvailability]);

  const checkBookingConflicts = () => {
    if (!selectedDate) return [];

    // Find bookings for this experience on this date
    const conflicts = safeBookings.filter((booking) => {
      // Check if any trip items match this experience and date
      return booking.trip.items.some(
        (item) =>
          item.experienceId === experienceId &&
          item.date === selectedDate &&
          (booking.status === 'confirmed' || booking.status === 'pending'),
      );
    });

    return conflicts;
  };

  const handleSave = () => {
    if (!selectedDate) return;

    const conflicts = checkBookingConflicts();

    // If trying to block a date with bookings, show warning
    if (isBlocked && conflicts.length > 0) {
      setConflictingBookings(conflicts);
      setShowConflictWarning(true);
      return;
    }

    // Check if slots are less than existing bookings
    const totalBookedSlots = conflicts.reduce((sum, booking) => {
      const item = booking.trip.items.find(
        (i) => i.experienceId === experienceId && i.date === selectedDate,
      );
      return sum + (item?.guests || 0);
    }, 0);

    if (!isBlocked && slots < totalBookedSlots) {
      toast.error(
        `Cannot reduce slots below ${totalBookedSlots} (current bookings)`,
      );
      return;
    }

    performSave();
  };

  const performSave = (forceBlock = false) => {
    if (!selectedDate) return;

    setIsSaving(true);

    try {
      const newAvailability: ExperienceAvailability = {
        id: `avail_${experienceId}_${selectedDate}`,
        experienceId,
        date: selectedDate,
        slotsAvailable: isBlocked || forceBlock ? 0 : slots,
        slotsTotal: slots,
        status: isBlocked || forceBlock ? 'blocked' : 'available',
      };

      // Update availability data
      const updatedData = safeAvailability.filter(
        (a) => a.date !== selectedDate,
      );
      updatedData.push(newAvailability);

      setAvailabilityData(updatedData);

      toast.success(
        `Availability updated for ${new Date(selectedDate).toLocaleDateString()}`,
      );

      // Close modal
      onClose();
      setShowConflictWarning(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleForceBlock = () => {
    performSave(true);
  };

  if (!selectedDate) return null;

  const dateDisplay = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] md:h-auto">
        <SheetHeader>
          <SheetTitle>Edit Availability</SheetTitle>
          <SheetDescription>{dateDisplay}</SheetDescription>
        </SheetHeader>

        {showConflictWarning ? (
          <div className="py-6 space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Booking Conflict Warning</AlertTitle>
              <AlertDescription>
                {conflictingBookings.length} existing booking
                {conflictingBookings.length !== 1 ? 's' : ''} on this date
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Affected Bookings:</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {conflictingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-3 bg-muted rounded-lg text-sm"
                  >
                    <p className="font-medium">Booking #{booking.reference}</p>
                    <p className="text-muted-foreground">
                      Status: {booking.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConflictWarning(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleForceBlock}
                disabled={isSaving}
                className="flex-1"
              >
                Block Anyway
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="py-6 space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="blocked-toggle" className="text-base">
                  Block this date
                </Label>
                <Switch
                  id="blocked-toggle"
                  checked={isBlocked}
                  onCheckedChange={setIsBlocked}
                />
              </div>

              {!isBlocked && (
                <div className="space-y-3">
                  <Label htmlFor="slots-input" className="text-base">
                    Slots Available
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setSlots(Math.max(0, slots - 1))}
                      className="h-12 w-12 p-0"
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <Input
                      id="slots-input"
                      type="number"
                      value={slots}
                      onChange={(e) => setSlots(parseInt(e.target.value) || 0)}
                      className="text-center text-xl h-12 font-semibold"
                      min="0"
                    />
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setSlots(slots + 1)}
                      className="h-12 w-12 p-0"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Number of guests that can book this experience
                  </p>
                </div>
              )}

              {isBlocked && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-center text-muted-foreground">
                    This date will be unavailable for bookings
                  </p>
                </div>
              )}
            </div>

            <SheetFooter className="gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
