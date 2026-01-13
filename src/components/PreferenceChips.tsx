import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { UserPreferences } from '@/lib/types';
import {
  User,
  Users,
  UsersRound,
  Baby,
  Wallet,
  TrendingUp,
  Gem,
  Mountain,
  Heart,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PreferenceChipsProps {
  preferences: UserPreferences;
  onPreferenceChange: (preferences: UserPreferences) => void;
}

interface ChipOption {
  id: string;
  label: string;
  icon: React.ElementType;
  category: 'groupType' | 'budget' | 'travelStyle';
  value: string;
}

const chipOptions: ChipOption[] = [
  // Group Type
  {
    id: 'solo',
    label: 'Solo',
    icon: User,
    category: 'groupType',
    value: 'solo',
  },
  {
    id: 'couple',
    label: 'Couple',
    icon: Users,
    category: 'groupType',
    value: 'couple',
  },
  {
    id: 'friends',
    label: 'Friends',
    icon: UsersRound,
    category: 'groupType',
    value: 'friends',
  },
  {
    id: 'family',
    label: 'Family',
    icon: Baby,
    category: 'groupType',
    value: 'family',
  },
  // Budget
  {
    id: 'budget',
    label: 'Budget',
    icon: Wallet,
    category: 'budget',
    value: 'budget',
  },
  {
    id: 'midrange',
    label: 'Mid-Range',
    icon: TrendingUp,
    category: 'budget',
    value: 'midrange',
  },
  {
    id: 'luxury',
    label: 'Luxury',
    icon: Gem,
    category: 'budget',
    value: 'luxury',
  },
  // Travel Style
  {
    id: 'adventure',
    label: 'Adventure',
    icon: Mountain,
    category: 'travelStyle',
    value: 'adventure',
  },
  {
    id: 'relaxation',
    label: 'Relaxation',
    icon: Heart,
    category: 'travelStyle',
    value: 'relaxation',
  },
  {
    id: 'culture',
    label: 'Culture',
    icon: Sparkles,
    category: 'travelStyle',
    value: 'culture',
  },
];

export function PreferenceChips({
  preferences,
  onPreferenceChange,
}: PreferenceChipsProps) {
  const isSelected = (chip: ChipOption): boolean => {
    if (chip.category === 'groupType')
      return preferences.groupType === chip.value;
    if (chip.category === 'budget') return preferences.budget === chip.value;
    if (chip.category === 'travelStyle')
      return preferences.travelStyles?.includes(chip.value as any) ?? false;
    return false;
  };

  const handleChipClick = (chip: ChipOption) => {
    const newPreferences = { ...preferences };

    if (chip.category === 'groupType') {
      newPreferences.groupType =
        preferences.groupType === chip.value
          ? undefined
          : (chip.value as UserPreferences['groupType']);
    } else if (chip.category === 'budget') {
      newPreferences.budget =
        preferences.budget === chip.value
          ? undefined
          : (chip.value as UserPreferences['budget']);
    } else if (chip.category === 'travelStyle') {
      // Toggle travel style in array
      const currentStyles = preferences.travelStyles ?? [];
      const styleValue = chip.value as
        | 'adventure'
        | 'relaxation'
        | 'culture'
        | 'wellness';
      if (currentStyles.includes(styleValue)) {
        newPreferences.travelStyles = currentStyles.filter(
          (s) => s !== styleValue,
        );
      } else {
        newPreferences.travelStyles = [...currentStyles, styleValue];
      }
    }

    onPreferenceChange(newPreferences);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-display text-lg font-semibold">
          Your Travel Style
        </h3>
        {(preferences.groupType ||
          preferences.budget ||
          (preferences.travelStyles &&
            preferences.travelStyles.length > 0)) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm text-primary hover:underline"
            onClick={() => onPreferenceChange({})}
          >
            Clear all
          </motion.button>
        )}
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {chipOptions.map((chip) => {
            const Icon = chip.icon;
            const selected = isSelected(chip);

            return (
              <motion.div
                key={chip.id}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
              >
                <Badge
                  variant={selected ? 'default' : 'outline'}
                  className={`
                    cursor-pointer whitespace-nowrap py-2 px-4 text-sm font-medium
                    transition-all duration-200 flex items-center gap-2
                    ${
                      selected
                        ? 'shadow-md ring-2 ring-primary/30'
                        : 'hover:bg-primary/5 hover:border-primary/50'
                    }
                  `}
                  onClick={() => handleChipClick(chip)}
                >
                  <Icon
                    className={`w-4 h-4 ${selected ? '' : 'text-muted-foreground'}`}
                  />
                  {chip.label}
                </Badge>
              </motion.div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
