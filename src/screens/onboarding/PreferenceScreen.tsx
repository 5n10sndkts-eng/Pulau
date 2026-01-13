/**
 * Preference Selection Screen (Onboarding Step 2/3)
 * Epic 4, Story 4.2: Build Travel Preference Selection Screen
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PreferenceScreenProps {
  onContinue: (preferences: PreferenceData) => void;
  onBack: () => void;
}

export interface PreferenceData {
  travelStyle: string[];
  groupType: string;
  budgetLevel: string;
}

const TRAVEL_STYLES = [
  { id: 'Adventure', label: 'Adventure', icon: '🏄' },
  { id: 'Relaxation', label: 'Relaxation', icon: '🧘' },
  { id: 'Culture', label: 'Culture', icon: '🏛️' },
  { id: 'Mix of Everything', label: 'Mix of Everything', icon: '✨' },
];

const GROUP_TYPES = [
  { id: 'Solo', label: 'Solo', icon: '🎒' },
  { id: 'Couple', label: 'Couple', icon: '💑' },
  { id: 'Friends', label: 'Friends', icon: '👥' },
  { id: 'Family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
];

const BUDGET_LEVELS = [
  { id: 'Budget-Conscious', label: 'Budget-Conscious', description: 'Under $50/day' },
  { id: 'Mid-Range', label: 'Mid-Range', description: '$50-150/day' },
  { id: 'Luxury', label: 'Luxury', description: 'Over $150/day' },
];

export function PreferenceScreen({ onContinue, onBack }: PreferenceScreenProps) {
  const [travelStyle, setTravelStyle] = useState<string[]>([]);
  const [groupType, setGroupType] = useState<string>('');
  const [budgetLevel, setBudgetLevel] = useState<string>('');

  const toggleTravelStyle = (style: string) => {
    setTravelStyle(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const isValid = travelStyle.length > 0 && groupType && budgetLevel;

  const handleContinue = () => {
    if (isValid) {
      onContinue({ travelStyle, groupType, budgetLevel });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-6 py-4 shadow-sm">
        <div className="text-center text-sm font-medium text-slate-600">2 of 3</div>
        <h2 className="mt-2 text-center text-2xl font-bold text-slate-900">
          Personalize Your Experience
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Travel Style Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Travel Style</h3>
            <div className="grid grid-cols-2 gap-3">
              {TRAVEL_STYLES.map(style => (
                <button
                  key={style.id}
                  onClick={() => toggleTravelStyle(style.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                    travelStyle.includes(style.id)
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  <span className="text-2xl">{style.icon}</span>
                  <span className="flex-1 font-medium text-slate-900">{style.label}</span>
                  {travelStyle.includes(style.id) && (
                    <Check className="h-5 w-5 text-teal-600" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Group Type Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Group Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {GROUP_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setGroupType(type.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                    groupType === type.id
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <span className="flex-1 font-medium text-slate-900">{type.label}</span>
                  {groupType === type.id && <Check className="h-5 w-5 text-teal-600" />}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Budget Level Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Budget Feel</h3>
            <div className="space-y-3">
              {BUDGET_LEVELS.map(budget => (
                <button
                  key={budget.id}
                  onClick={() => setBudgetLevel(budget.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-all',
                    budgetLevel === budget.id
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  <div>
                    <div className="font-medium text-slate-900">{budget.label}</div>
                    <div className="text-sm text-slate-600">{budget.description}</div>
                  </div>
                  {budgetLevel === budget.id && <Check className="h-5 w-5 text-teal-600" />}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 border-t bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl gap-3">
          <Button onClick={onBack} variant="outline" className="flex-1">
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!isValid}
            className="flex-1 bg-teal-600 hover:bg-teal-700"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
