import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PremiumContainer } from '@/components/ui/premium-container';
import { Calendar } from '@/components/ui/calendar';
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
  Gem,
  TrendingUp,
  Check,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fadeInUp,
  staggerContainer,
  scaleIn,
} from '@/components/ui/motion.variants';

interface OnboardingProps {
  onComplete: (
    preferences: UserPreferences,
    dates?: { start: string; end: string },
  ) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    travelStyles: [],
    groupType: undefined,
    budget: undefined,
  });

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleTravelStyleSelect = (
    style: 'adventure' | 'relaxation' | 'culture' | 'wellness',
  ) => {
    const current = preferences.travelStyles || [];
    if (current.includes(style)) {
      setPreferences({
        ...preferences,
        travelStyles: current.filter((s) => s !== style),
      });
    } else {
      setPreferences({ ...preferences, travelStyles: [...current, style] });
    }
  };

  const handleGroupTypeSelect = (
    type: 'solo' | 'couple' | 'friends' | 'family',
  ) => {
    setPreferences({ ...preferences, groupType: type });
  };

  const handleBudgetSelect = (budget: 'budget' | 'midrange' | 'luxury') => {
    setPreferences({ ...preferences, budget });
  };

  const handleNext = () => {
    if (
      step === 1 &&
      (!preferences.travelStyles || preferences.travelStyles.length === 0)
    ) {
      toast.error('Please select at least one travel style');
      return;
    }
    if (step === 2 && !preferences.groupType) {
      toast.error('Who are you traveling with?');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleFinish = () => {
    if (!preferences.budget) {
      toast.error('Please select a budget level');
      return;
    }

    const dates =
      startDate && endDate
        ? {
            start: startDate.toISOString().split('T')[0] || '',
            end: endDate.toISOString().split('T')[0] || '',
          }
        : undefined;

    onComplete(preferences, dates);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-2xl"
          >
            <PremiumContainer variant="glass" className="p-8 md:p-12">
              <motion.div variants={fadeInUp} className="text-center mb-10">
                <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3 block">
                  Step 1 of 3
                </span>
                <h1 className="text-4xl font-display font-bold mb-4">
                  Your Bali Style?
                </h1>
                <p className="text-muted-foreground text-lg">
                  Select the vibes that speak to your soul
                </p>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-2 gap-4 mb-10"
              >
                {[
                  {
                    id: 'adventure',
                    label: 'Adventure',
                    icon: Mountain,
                    color: 'text-primary',
                  },
                  {
                    id: 'relaxation',
                    label: 'Relaxation',
                    icon: Heart,
                    color: 'text-accent',
                  },
                  {
                    id: 'culture',
                    label: 'Culture',
                    icon: Sparkles,
                    color: 'text-golden',
                  },
                  {
                    id: 'wellness',
                    label: 'Wellness',
                    icon: Palmtree,
                    color: 'text-success',
                  },
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleTravelStyleSelect(style.id as any)}
                    className={`relative p-8 rounded-3xl border-2 transition-all duration-300 group overflow-hidden ${
                      preferences.travelStyles?.includes(style.id as any)
                        ? 'border-primary bg-primary/5 shadow-xl'
                        : 'border-muted/20 bg-card/50 hover:border-primary/30 hover:bg-card hover:-translate-y-1'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-4 relative z-10">
                      <div
                        className={`p-4 rounded-2xl bg-background shadow-premium transition-transform duration-300 group-hover:scale-110 ${style.color}`}
                      >
                        <style.icon className="w-8 h-8" />
                      </div>
                      <span className="font-display font-bold text-lg">
                        {style.label}
                      </span>
                    </div>
                    {preferences.travelStyles?.includes(style.id as any) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-1"
                      >
                        <Check className="w-3 h-3" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </motion.div>

              <motion.div variants={fadeInUp} className="flex justify-end">
                <Button
                  onClick={handleNext}
                  variant="premium"
                  size="lg"
                  className="rounded-full px-10 h-14 text-lg"
                >
                  Continue
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </PremiumContainer>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-2xl"
          >
            <PremiumContainer variant="glass" className="p-8 md:p-12">
              <motion.div variants={fadeInUp} className="text-center mb-10">
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handleBack}
                    className="p-3 rounded-full hover:bg-muted/10 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <span className="text-primary font-bold text-xs uppercase tracking-[0.2em]">
                    Step 2 of 3
                  </span>
                  <div className="w-11" /> {/* Spacer */}
                </div>
                <h1 className="text-4xl font-display font-bold mb-4">
                  Travel Party?
                </h1>
                <p className="text-muted-foreground text-lg">
                  Who are you exploring paradise with?
                </p>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-2 gap-4 mb-10"
              >
                {[
                  {
                    id: 'solo',
                    label: 'Solo',
                    icon: User,
                    color: 'text-primary',
                  },
                  {
                    id: 'couple',
                    label: 'Couple',
                    icon: Users,
                    color: 'text-accent',
                  },
                  {
                    id: 'friends',
                    label: 'Friends',
                    icon: UsersRound,
                    color: 'text-primary',
                  },
                  {
                    id: 'family',
                    label: 'Family',
                    icon: Baby,
                    color: 'text-golden',
                  },
                ].map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleGroupTypeSelect(group.id as any)}
                    className={`p-8 rounded-3xl border-2 transition-all duration-300 group ${
                      preferences.groupType === group.id
                        ? 'border-primary bg-primary/5 shadow-xl'
                        : 'border-muted/20 bg-card/50 hover:border-primary/30 hover:bg-card hover:-translate-y-1'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div
                        className={`p-4 rounded-2xl bg-background shadow-premium transition-transform duration-300 group-hover:scale-110 ${group.color}`}
                      >
                        <group.icon className="w-8 h-8" />
                      </div>
                      <span className="font-display font-bold text-lg">
                        {group.label}
                      </span>
                    </div>
                  </button>
                ))}
              </motion.div>

              <motion.div variants={fadeInUp} className="flex justify-end">
                <Button
                  onClick={handleNext}
                  variant="premium"
                  size="lg"
                  className="rounded-full px-10 h-14 text-lg"
                >
                  Continue
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </PremiumContainer>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-4xl"
          >
            <PremiumContainer variant="glass" className="p-8 md:p-12">
              <motion.div variants={fadeInUp} className="text-center mb-10">
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handleBack}
                    className="p-3 rounded-full hover:bg-muted/10 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <span className="text-primary font-bold text-xs uppercase tracking-[0.2em]">
                    Final Step
                  </span>
                  <div className="w-11" />
                </div>
                <h1 className="text-4xl font-display font-bold mb-4">
                  Budget & Dates
                </h1>
                <p className="text-muted-foreground text-lg">
                  Define your dream's scope
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-12 mb-12">
                <motion.div variants={fadeInUp} className="space-y-6">
                  <h3 className="text-xl font-display font-bold flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-primary" />
                    Budget Level
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      {
                        id: 'budget',
                        label: 'Budget-Conscious',
                        icon: Wallet,
                        color: 'text-success',
                      },
                      {
                        id: 'midrange',
                        label: 'Balanced',
                        icon: TrendingUp,
                        color: 'text-accent',
                      },
                      {
                        id: 'luxury',
                        label: 'Luxury',
                        icon: Gem,
                        color: 'text-golden',
                      },
                    ].map((budget) => (
                      <button
                        key={budget.id}
                        onClick={() => handleBudgetSelect(budget.id as any)}
                        className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all group ${
                          preferences.budget === budget.id
                            ? 'border-primary bg-primary/5'
                            : 'border-muted/10 bg-card/30 hover:bg-card hover:border-primary/20'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <budget.icon className={`w-5 h-5 ${budget.color}`} />
                          <span className="font-bold">{budget.label}</span>
                        </div>
                        {preferences.budget === budget.id && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="space-y-6">
                  <h3 className="text-xl font-display font-bold flex items-center gap-2">
                    <Palmtree className="w-5 h-5 text-primary" />
                    Trip Dates (Optional)
                  </h3>
                  <div className="glass-dark p-4 rounded-3xl border border-white/10 shadow-inner">
                    <Calendar
                      mode="range"
                      selected={{ from: startDate, to: endDate }}
                      onSelect={(range) => {
                        setStartDate(range?.from);
                        setEndDate(range?.to);
                      }}
                      disabled={(date) => date < new Date()}
                      className="mx-auto"
                    />
                  </div>
                </motion.div>
              </div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col items-center gap-4"
              >
                <Button
                  onClick={handleFinish}
                  variant="premium"
                  size="lg"
                  className="rounded-full px-16 h-16 text-xl w-full md:w-auto shadow-xl"
                >
                  Complete Setup
                </Button>
                <button
                  onClick={handleFinish}
                  className="text-muted-foreground text-sm hover:text-primary transition-colors font-medium border-b border-transparent hover:border-primary"
                >
                  Skip dates for now — manually plan later
                </button>
              </motion.div>
            </PremiumContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
