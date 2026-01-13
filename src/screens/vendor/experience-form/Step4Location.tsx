import { WizardStepProps } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

export function Step4Location({
  data,
  updateData,
  onNext,
  onBack,
}: WizardStepProps) {
  const isValid = data.meetingPointAddress;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-display font-bold">
          Location & Meeting Point
        </h2>
        <p className="text-muted-foreground">
          Where should travelers meet you?
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mpName">Meeting Point Name</Label>
          <Input
            id="mpName"
            value={data.meetingPointName || ''}
            onChange={(e) => updateData({ meetingPointName: e.target.value })}
            placeholder="e.g., Sanur Harbor Ticket Office"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="address"
              value={data.meetingPointAddress || ''}
              onChange={(e) =>
                updateData({ meetingPointAddress: e.target.value })
              }
              className="pl-9"
              placeholder="e.g., Jl. Hang Tuah No. 45"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lat">Latitude</Label>
            <Input
              id="lat"
              type="number"
              value={data.meetingPointLat || ''}
              onChange={(e) =>
                updateData({ meetingPointLat: parseFloat(e.target.value) })
              }
              placeholder="-8.1234"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lng">Longitude</Label>
            <Input
              id="lng"
              type="number"
              value={data.meetingPointLng || ''}
              onChange={(e) =>
                updateData({ meetingPointLng: parseFloat(e.target.value) })
              }
              placeholder="115.1234"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea
            id="instructions"
            value={data.meetingPointInstructions || ''}
            onChange={(e) =>
              updateData({ meetingPointInstructions: e.target.value })
            }
            placeholder="e.g., Look for the staff in blue shirts..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!isValid}
            className="flex-1 md:flex-none"
          >
            Next: Inclusions
          </Button>
        </div>
      </div>
    </div>
  );
}
