import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import type { Conflict } from '@/lib/conflictDetection';
import type { TripItem, Experience } from '@/lib/types';
import {
  parseTimeToMinutes,
  minutesToTime,
  parseDuration,
} from '@/lib/conflictDetection';

interface ConflictResolutionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  conflict: Conflict | null;
  items: TripItem[];
  getExperience: (id: string) => Experience | undefined;
  onResolve: (itemId: string, newTime: string) => void;
  onRemove: (itemId: string) => void;
}

const findNextAvailableSlot = (
  dayItems: TripItem[],
  getExperience: (id: string) => Experience | undefined,
  requiredDuration: number,
  excludeItemId: string,
): string | null => {
  const slots: { start: number; end: number }[] = [];

  dayItems.forEach((item) => {
    if (item.experienceId === excludeItemId || !item.time) return;
    const exp = getExperience(item.experienceId);
    if (!exp) return;

    const duration = parseDuration(exp.duration);
    const start = parseTimeToMinutes(item.time);
    const end = start + Math.round(duration * 60);
    slots.push({ start, end });
  });

  slots.sort((a, b) => a.start - b.start);

  const dayStart = 6 * 60;
  const dayEnd = 23 * 60;

  let currentTime = dayStart;

  for (const slot of slots) {
    const gap = slot.start - currentTime;
    if (gap >= Math.round(requiredDuration * 60)) {
      return minutesToTime(currentTime);
    }
    currentTime = Math.max(currentTime, slot.end);
  }

  if (dayEnd - currentTime >= Math.round(requiredDuration * 60)) {
    return minutesToTime(currentTime);
  }

  return null;
};

export function ConflictResolutionSheet({
  isOpen,
  onClose,
  conflict,
  items,
  getExperience,
  onResolve,
  onRemove,
}: ConflictResolutionSheetProps) {
  if (!conflict) return null;

  const itemAId = conflict.itemId1;
  const itemBId = conflict.itemId2;
  const itemA = items.find((i) => i.experienceId === itemAId);
  const itemB = items.find((i) => i.experienceId === itemBId);
  const expA = getExperience(itemAId);
  const expB = getExperience(itemBId);

  if (!itemA || !itemB || !expA || !expB) return null;

  const dayItems = items.filter((i) => i.date === conflict.date);
  const durationA = parseDuration(expA.duration);
  const durationB = parseDuration(expB.duration);

  const nextSlotA = findNextAvailableSlot(
    dayItems,
    getExperience,
    durationA,
    itemAId,
  );
  const nextSlotB = findNextAvailableSlot(
    dayItems,
    getExperience,
    durationB,
    itemBId,
  );

  const handleResolve = (itemId: string, newTime: string | null) => {
    if (newTime) {
      onResolve(itemId, newTime);
      toast.success('Conflict resolved');
    } else {
      toast.error('No available time slot found');
    }
    onClose();
  };

  const handleRemove = (itemId: string) => {
    onRemove(itemId);
    toast.success('Item removed from trip');
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Resolve Schedule Conflict</SheetTitle>
          <SheetDescription>
            These activities overlap by {conflict.overlapMinutes} minute
            {conflict.overlapMinutes !== 1 ? 's' : ''}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium">{expA.title}</p>
            <p className="text-xs text-muted-foreground">
              {itemA.time} • {expA.duration}
            </p>
          </div>

          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium">{expB.title}</p>
            <p className="text-xs text-muted-foreground">
              {itemB.time} • {expB.duration}
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <p className="text-sm font-medium">Resolution options:</p>

            {nextSlotA && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleResolve(itemAId, nextSlotA)}
              >
                Move {expA.title.slice(0, 20)}... to {nextSlotA}
              </Button>
            )}

            {nextSlotB && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleResolve(itemBId, nextSlotB)}
              >
                Move {expB.title.slice(0, 20)}... to {nextSlotB}
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full justify-start text-destructive"
              onClick={() => handleRemove(itemAId)}
            >
              Remove {expA.title.slice(0, 20)}... from trip
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-destructive"
              onClick={() => handleRemove(itemBId)}
            >
              Remove {expB.title.slice(0, 20)}... from trip
            </Button>
          </div>

          <Button variant="ghost" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
