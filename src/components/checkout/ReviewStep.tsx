import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trip } from '@/lib/types';
import { getExperienceById, formatPrice, getDayLabel } from '@/lib/helpers';
import { checkForConflicts } from '@/lib/helpers';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReviewStepProps {
  trip: Trip;
  onBack: () => void;
  onContinue: () => void;
}

export function ReviewStep({ trip, onBack, onContinue }: ReviewStepProps) {
  const itemsByDate: Record<string, typeof trip.items> = {};
  const unscheduledItems = trip.items.filter((item) => !item.date);

  trip.items.forEach((item) => {
    if (item.date) {
      if (!itemsByDate[item.date]) {
        itemsByDate[item.date] = [];
      }
      itemsByDate[item.date]!.push(item);
    }
  });

  const sortedDates = Object.keys(itemsByDate).sort();

  // Real-time conflict detection
  const conflicts = checkForConflicts(trip.items);
  const hasConflicts = conflicts.length > 0;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold">Review Your Trip</h1>
          <p className="text-muted-foreground">
            Make sure everything looks good before we continue
          </p>
        </div>
      </div>

      {hasConflicts ? (
        <Alert
          variant="destructive"
          className="border-destructive/50 bg-destructive/5 animate-in fade-in slide-in-from-top-4 duration-500"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-1">
            <p className="font-semibold">Scheduling Conflict Detected</p>
            <p className="text-sm opacity-90 text-destructive-foreground">
              You have {conflicts.length} overlapping{' '}
              {conflicts.length === 1 ? 'activity' : 'activities'} in your
              schedule. Please adjust times in the trip builder before
              continuing.
            </p>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-success bg-success/5">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            No scheduling conflicts found - you're all set!
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {sortedDates.map((date, index) => (
          <Card key={date} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-display font-bold text-sm text-primary">
                  DAY {index + 1}
                </p>
                <p className="text-sm text-muted-foreground">
                  {getDayLabel(date)}
                </p>
              </div>
              <Badge variant="outline">
                {itemsByDate[date]?.length || 0} activities
              </Badge>
            </div>

            <div className="space-y-3">
              {itemsByDate[date]?.map((item, itemIndex) => {
                const experience = getExperienceById(item.experienceId);
                if (!experience) return null;

                return (
                  <div
                    key={itemIndex}
                    className="flex gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <img
                      src={experience.images[0]}
                      alt={experience.title}
                      className="w-16 h-16 rounded object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-tight mb-1">
                        {experience.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-1">
                        {item.time} • {experience.duration} • {item.guests}{' '}
                        guests
                      </p>
                      <p className="text-sm font-semibold">
                        {formatPrice(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}

        {unscheduledItems.length > 0 && (
          <Card className="p-5 border-dashed">
            <div className="flex items-center justify-between mb-4">
              <p className="font-display font-bold text-sm">
                Not Yet Scheduled
              </p>
              <Badge variant="outline">{unscheduledItems.length} items</Badge>
            </div>
            <div className="space-y-3">
              {unscheduledItems.map((item, index) => {
                const experience = getExperienceById(item.experienceId);
                if (!experience) return null;

                return (
                  <div
                    key={index}
                    className="flex gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <img
                      src={experience.images[0]}
                      alt={experience.title}
                      className="w-16 h-16 rounded object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-tight mb-1">
                        {experience.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-1">
                        {experience.duration} • {item.guests} guests
                      </p>
                      <p className="text-sm font-semibold">
                        {formatPrice(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      <Card className="p-5 bg-coral/5 border-coral">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({trip.items.length} experiences)</span>
            <span>{formatPrice(trip.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Service fee</span>
            <span>{formatPrice(trip.serviceFee)}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatPrice(trip.total)}</span>
          </div>
        </div>
      </Card>

      <Button
        size="lg"
        className="w-full"
        onClick={onContinue}
        disabled={hasConflicts}
      >
        {hasConflicts
          ? 'Resolve Conflicts to Continue'
          : 'Continue to Traveler Details'}
      </Button>
    </div>
  );
}
