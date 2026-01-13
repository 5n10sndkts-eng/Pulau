/**
 * Single-Screen Onboarding
 * Story: 33.2 - Single-Screen Onboarding Redesign
 *
 * Allows new users to set travel preferences quickly on a single screen
 * with three distinct sections: Vibe, Group Type, and Budget.
 */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PremiumContainer } from '@/components/ui/premium-container';
import { UserPreferences } from '@/lib/types';
import {
  Mountain,
  Heart,
  Sparkles,
  Palmtree,
  User,
  Users,
  UsersRound,
  Baby,
  Wallet,
  TrendingUp,
  Gem,
  Check,
  Map,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/components/ui/motion.variants';

interface OnboardingSingleScreenProps {
  onComplete: (preferences: UserPreferences) => void;
  onSkip: () => void;
}

const TRAVEL_STYLES = [
  {
    id: 'adventure',
    label: 'Adventure',
    icon: Mountain,
    color: 'text-primary',
  },
  { id: 'relaxation', label: 'Relaxation', icon: Heart, color: 'text-accent' },
  { id: 'culture', label: 'Culture', icon: Sparkles, color: 'text-golden' },
  { id: 'wellness', label: 'Wellness', icon: Palmtree, color: 'text-success' },
] as const;

const GROUP_TYPES = [
  { id: 'solo', label: 'Solo', icon: User },
  { id: 'couple', label: 'Couple', icon: Users },
  { id: 'friends', label: 'Friends', icon: UsersRound },
  { id: 'family', label: 'Family', icon: Baby },
] as const;

const BUDGET_LEVELS = [
  { id: 'budget', label: 'Budget', icon: Wallet, color: 'text-success' },
  {
    id: 'midrange',
    label: 'Mid-Range',
    icon: TrendingUp,
    color: 'text-accent',
  },
  { id: 'luxury', label: 'Luxury', icon: Gem, color: 'text-golden' },
] as const;

type TravelStyle = (typeof TRAVEL_STYLES)[number]['id'];
type GroupType = (typeof GROUP_TYPES)[number]['id'];
type BudgetLevel = (typeof BUDGET_LEVELS)[number]['id'];

export function OnboardingSingleScreen({
  onComplete,
  onSkip,
}: OnboardingSingleScreenProps) {
  const [travelStyles, setTravelStyles] = useState<TravelStyle[]>([]);
  const [groupType, setGroupType] = useState<GroupType | undefined>(undefined);
  const [budget, setBudget] = useState<BudgetLevel | undefined>(undefined);

  // Validation: at least one vibe, group, and budget selected
  const isValid = useMemo(() => {
    return (
      travelStyles.length > 0 && groupType !== undefined && budget !== undefined
    );
  }, [travelStyles, groupType, budget]);

  const handleTravelStyleToggle = (style: TravelStyle) => {
    setTravelStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style],
    );
  };

  const handleStartPlanning = () => {
    if (!isValid) return;

    const preferences: UserPreferences = {
      travelStyles,
      groupType,
      budget,
    };
    onComplete(preferences);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="w-full max-w-2xl"
      >
        <PremiumContainer variant="glass" className="p-6 md:p-10">
          {/* Header */}
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-premium">
                <Map className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              Plan Your Dream Trip
            </h1>
            <p className="text-muted-foreground">
              Tell us your preferences to discover perfect experiences
            </p>
          </motion.div>

          {/* Section 1: Vibe (Multi-select) */}
          <motion.div variants={fadeInUp} className="mb-8">
            <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              What's Your Vibe?
              <span className="text-xs text-muted-foreground font-normal">
                (select all that apply)
              </span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TRAVEL_STYLES.map((style) => {
                const isSelected = travelStyles.includes(style.id);
                const Icon = style.icon;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => handleTravelStyleToggle(style.id)}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-muted/20 bg-card/50 hover:border-primary/30 hover:bg-card'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className={`w-6 h-6 ${style.color}`} />
                      <span className="font-medium text-sm">{style.label}</span>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5"
                      >
                        <Check className="w-3 h-3" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Section 2: Group Type (Single-select) */}
          <motion.div variants={fadeInUp} className="mb-8">
            <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Who's Traveling?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {GROUP_TYPES.map((group) => {
                const isSelected = groupType === group.id;
                const Icon = group.icon;
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setGroupType(group.id)}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-muted/20 bg-card/50 hover:border-primary/30 hover:bg-card'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className="w-6 h-6 text-muted-foreground" />
                      <span className="font-medium text-sm">{group.label}</span>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5"
                      >
                        <Check className="w-3 h-3" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Section 3: Budget (Single-select) */}
          <motion.div variants={fadeInUp} className="mb-8">
            <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Budget Range
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {BUDGET_LEVELS.map((level) => {
                const isSelected = budget === level.id;
                const Icon = level.icon;
                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setBudget(level.id)}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-muted/20 bg-card/50 hover:border-primary/30 hover:bg-card'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className={`w-6 h-6 ${level.color}`} />
                      <span className="font-medium text-sm">{level.label}</span>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5"
                      >
                        <Check className="w-3 h-3" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col items-center gap-3"
          >
            <Button
              onClick={handleStartPlanning}
              disabled={!isValid}
              variant="premium"
              size="lg"
              className="w-full md:w-auto rounded-full px-12 h-14 text-lg"
            >
              Start Planning
            </Button>
            <button
              type="button"
              onClick={onSkip}
              className="text-muted-foreground text-sm hover:text-primary transition-colors font-medium"
            >
              Skip & Explore
            </button>
          </motion.div>
        </PremiumContainer>
      </motion.div>
    </div>
  );
}
