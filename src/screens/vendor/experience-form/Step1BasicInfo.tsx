import { WizardStepProps } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExperienceCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';

export function Step1BasicInfo({ data, updateData, onNext }: WizardStepProps) {
  const isValid = data.title && data.category && data.description;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-display font-bold">Basis Information</h2>
        <p className="text-muted-foreground">
          Start with the essentials of your experience.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Experience Title *</Label>
          <Input
            id="title"
            value={data.title || ''}
            onChange={(e) => updateData({ title: e.target.value })}
            placeholder="e.g., Sunrise Trek at Mount Batur"
            maxLength={200}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select
              value={data.category}
              onValueChange={(val) =>
                updateData({ category: val as ExperienceCategory })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ExperienceCategory.WaterAdventures}>
                  Water Adventures
                </SelectItem>
                <SelectItem value={ExperienceCategory.LandExplorations}>
                  Land Explorations
                </SelectItem>
                <SelectItem value={ExperienceCategory.CultureExperiences}>
                  Culture & Experiences
                </SelectItem>
                <SelectItem value={ExperienceCategory.FoodNightlife}>
                  Food & Nightlife
                </SelectItem>
                <SelectItem value={ExperienceCategory.Transportation}>
                  Getting Around
                </SelectItem>
                <SelectItem value={ExperienceCategory.Stays}>
                  Destinations & Stays
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcategory">Subcategory</Label>
            <Input
              id="subcategory"
              value={data.subcategory || ''}
              onChange={(e) => updateData({ subcategory: e.target.value })}
              placeholder="e.g., Hiking, Snorkeling, Cooking Class"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={data.description || ''}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Describe what travelers will experience..."
            className="h-32"
          />
        </div>

        <div className="pt-4">
          <Button
            onClick={onNext}
            disabled={!isValid}
            className="w-full md:w-auto"
          >
            Next: Pricing
          </Button>
        </div>
      </div>
    </div>
  );
}
