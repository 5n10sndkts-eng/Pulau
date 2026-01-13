import { useState } from 'react';
import { WizardStepProps } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X, Check } from 'lucide-react';
import { ExperienceInclusionRecord } from '@/lib/types';

export function Step5Inclusions({
  data,
  onNext,
  onBack,
}: WizardStepProps & {
  inclusions: ExperienceInclusionRecord[];
  setInclusions: (i: ExperienceInclusionRecord[]) => void;
}) {
  // Local state for the inputs
  const [incInput, setIncInput] = useState('');
  const [excInput, setExcInput] = useState('');

  // We need to manage the inclusions list in the parent or pass a specific updater
  // But to keep WizardStepProps generic, we'll assume the parent handles the main 'inclusions' array separately
  // For now, let's use the extra props passed (which requires casting or updating the type definition, but I'll cast inside the parent index)
  // Wait, I'll update the component signature to accept these props specifically.

  // Note: The parent passes `inclusions` and `setInclusions` as extra props.
  const props = arguments[0] as WizardStepProps & {
    inclusions: ExperienceInclusionRecord[];
    setInclusions: (i: ExperienceInclusionRecord[]) => void;
  };
  const { inclusions, setInclusions } = props;

  const addInclusion = (
    isIncluded: boolean,
    text: string,
    setInput: (s: string) => void,
  ) => {
    if (!text.trim()) return;
    const newItem: ExperienceInclusionRecord = {
      id: crypto.randomUUID(),
      experienceId: data.id || '',
      itemText: text,
      isIncluded,
      createdAt: new Date().toISOString(),
    };
    setInclusions([...inclusions, newItem]);
    setInput('');
  };

  const removeInclusion = (id: string) => {
    setInclusions(inclusions.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-display font-bold">
          Inclusions & Exclusions
        </h2>
        <p className="text-muted-foreground">
          Be transparent about what is covered.
        </p>
      </div>

      <div className="space-y-6">
        {/* Included List */}
        <div className="space-y-3">
          <Label className="text-emerald-600 font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" /> What's Included
          </Label>
          <div className="flex gap-2">
            <Input
              value={incInput}
              onChange={(e) => setIncInput(e.target.value)}
              placeholder="e.g., Hotel pickup, Lunch, Equipment"
              onKeyDown={(e) =>
                e.key === 'Enter' && addInclusion(true, incInput, setIncInput)
              }
            />
            <Button
              size="icon"
              onClick={() => addInclusion(true, incInput, setIncInput)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <ul className="space-y-2">
            {inclusions
              .filter((i) => i.isIncluded)
              .map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between bg-emerald-50/50 p-2 rounded-md border border-emerald-100"
                >
                  <span className="text-sm">{item.itemText}</span>
                  <button
                    onClick={() => removeInclusion(item.id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
          </ul>
        </div>

        {/* Not Included List */}
        <div className="space-y-3">
          <Label className="text-red-600 font-semibold flex items-center gap-2">
            <X className="w-4 h-4" /> Not Included
          </Label>
          <div className="flex gap-2">
            <Input
              value={excInput}
              onChange={(e) => setExcInput(e.target.value)}
              placeholder="e.g., Gratuities, Alcohol"
              onKeyDown={(e) =>
                e.key === 'Enter' && addInclusion(false, excInput, setExcInput)
              }
            />
            <Button
              size="icon"
              variant="secondary"
              onClick={() => addInclusion(false, excInput, setExcInput)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <ul className="space-y-2">
            {inclusions
              .filter((i) => !i.isIncluded)
              .map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between bg-red-50/50 p-2 rounded-md border border-red-100"
                >
                  <span className="text-sm">{item.itemText}</span>
                  <button
                    onClick={() => removeInclusion(item.id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
          </ul>
        </div>

        <div className="flex gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext} className="flex-1 md:flex-none">
            Create Draft & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
