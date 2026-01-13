import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { vendorService } from '@/lib/vendorService';
import { VendorCapabilities } from '@/lib/vendorStateMachine';
import { toast } from 'sonner';

interface BookingPolicyToggleProps {
  experienceId: string;
  instantBookEnabled: boolean;
  vendorCapabilities: VendorCapabilities;
  onUpdate?: (enabled: boolean) => void;
}

export function BookingPolicyToggle({
  experienceId,
  instantBookEnabled,
  vendorCapabilities,
  onUpdate,
}: BookingPolicyToggleProps) {
  const [isEnabled, setIsEnabled] = useState(instantBookEnabled);
  const [isUpdating, setIsUpdating] = useState(false);

  const canEnable = vendorCapabilities.canEnableInstantBook;

  const handleToggle = async (checked: boolean) => {
    if (!canEnable) return;

    setIsUpdating(true);
    try {
      await vendorService.updateExperienceInstantBook(experienceId, checked);
      setIsEnabled(checked);
      onUpdate?.(checked);
      toast.success(
        checked
          ? 'Instant Book enabled! Travelers can now book immediately.'
          : 'Switched to Request to Book mode.',
      );
    } catch (error) {
      console.error('Failed to update booking policy:', error);
      toast.error('Failed to update booking policy');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Booking Policy
        </CardTitle>
        <CardDescription>
          Control how travelers can book this experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canEnable && (
          <Alert variant="default" className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Complete payment setup required.</strong> Instant Book is
              only available for vendors with verified payment accounts. Please
              complete your Stripe onboarding to enable this feature.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="instant-book" className="font-medium">
                Instant Book
              </Label>
              {isEnabled && canEnable && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  <Zap className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {isEnabled
                ? 'Travelers can book instantly without waiting for approval'
                : 'Travelers must request a booking and wait for your approval'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isUpdating && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Switch
              id="instant-book"
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={!canEnable || isUpdating}
              aria-label="Toggle instant book"
            />
          </div>
        </div>

        <div className="grid gap-3 pt-2">
          <div className="flex items-start gap-3 text-sm">
            <Zap className="h-4 w-4 mt-0.5 text-yellow-500 shrink-0" />
            <div>
              <p className="font-medium">Instant Book</p>
              <p className="text-muted-foreground">
                Bookings are confirmed immediately. Best for high-demand
                experiences.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Clock className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
            <div>
              <p className="font-medium">Request to Book</p>
              <p className="text-muted-foreground">
                You review and approve each booking request. Slot is held for 24
                hours.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
