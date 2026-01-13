import { WizardStepProps } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Difficulty } from '@/lib/types';

const COMMON_LANGUAGES = [
  'English',
  'Indonesian',
  'Mandarin',
  'French',
  'German',
  'Spanish',
  'Japanese',
  'Russian',
];

export function Step3Details({
  data,
  updateData,
  onNext,
  onBack,
}: WizardStepProps) {
  const toggleLanguage = (lang: string) => {
    const current = data.languages || [];
    if (current.includes(lang)) {
      updateData({ languages: current.filter((l) => l !== lang) });
    } else {
      updateData({ languages: [...current, lang] });
    }
  };

  const isValid =
    data.durationHours &&
    data.groupSizeMin &&
    data.groupSizeMax &&
    data.groupSizeMin <= data.groupSizeMax;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-display font-bold">Details & Logistics</h2>
        <p className="text-muted-foreground">
          Help travelers understand what to expect.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (Hours) *</Label>
            <Input
              id="duration"
              type="number"
              min="0.5"
              step="0.5"
              value={data.durationHours || ''}
              onChange={(e) =>
                updateData({ durationHours: parseFloat(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={data.startTime || ''}
              onChange={(e) => updateData({ startTime: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minGroup">Min Group Size *</Label>
            <Input
              id="minGroup"
              type="number"
              min="1"
              value={data.groupSizeMin || ''}
              onChange={(e) =>
                updateData({ groupSizeMin: parseInt(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxGroup">Max Group Size *</Label>
            <Input
              id="maxGroup"
              type="number"
              min="1"
              value={data.groupSizeMax || ''}
              onChange={(e) =>
                updateData({ groupSizeMax: parseInt(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Difficulty Level</Label>
          <Select
            value={data.difficulty || Difficulty.Easy}
            onValueChange={(val) =>
              updateData({ difficulty: val as Difficulty })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Difficulty.Easy}>
                Easy (Accessible to all)
              </SelectItem>
              <SelectItem value={Difficulty.Moderate}>
                Moderate (Some physical effort)
              </SelectItem>
              <SelectItem value={Difficulty.Challenging}>
                Challenging (High fitness required)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Languages Spoken</Label>
          <div className="grid grid-cols-2 gap-2">
            {COMMON_LANGUAGES.map((lang) => (
              <div key={lang} className="flex items-center space-x-2">
                <Checkbox
                  id={`lang-${lang}`}
                  checked={(data.languages || []).includes(lang)}
                  onCheckedChange={() => toggleLanguage(lang)}
                />
                <label
                  htmlFor={`lang-${lang}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {lang}
                </label>
              </div>
            ))}
          </div>
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
            Next: Location
          </Button>
        </div>
      </div>
    </div>
  );
}
