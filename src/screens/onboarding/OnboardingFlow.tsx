/**
 * Onboarding Flow Container
 * Epic 4: Onboarding & Personalization
 *
 * Orchestrates the 3-screen onboarding flow and saves preferences
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { WelcomeScreen } from './WelcomeScreen';
import { PreferenceScreen, PreferenceData } from './PreferenceScreen';
import { TripDatesScreen } from './TripDatesScreen';
import { preferenceService } from '@/lib/preferenceService';
import { useAuth } from '@/contexts/AuthContext';

type OnboardingStep = 'welcome' | 'preferences' | 'dates';

export function OnboardingFlow() {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [preferences, setPreferences] = useState<PreferenceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleWelcomeContinue = () => {
    setStep('preferences');
  };

  const handlePreferencesContinue = (prefs: PreferenceData) => {
    setPreferences(prefs);
    setStep('dates');
  };

  const handleDatesComplete = async (dates: {
    startDate?: string;
    endDate?: string;
  }) => {
    if (!user || !preferences) return;

    setIsLoading(true);

    try {
      // Save preferences to database
      await preferenceService.upsertPreferences(user.id, {
        travelStyle: preferences.travelStyle,
        groupType: preferences.groupType,
        budgetLevel: preferences.budgetLevel,
        tripStartDate: dates.startDate,
        tripEndDate: dates.endDate,
      });

      // Mark onboarding as complete
      await preferenceService.markOnboardingComplete(user.id);

      toast.success('Welcome to Pulau! 🎉');

      // Navigate to home screen
      navigate('/home', { replace: true });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    handleDatesComplete({});
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
          <p className="text-slate-600">Setting up your experience...</p>
        </div>
      </div>
    );
  }

  if (step === 'welcome') {
    return <WelcomeScreen onContinue={handleWelcomeContinue} />;
  }

  if (step === 'preferences') {
    return (
      <PreferenceScreen
        onContinue={handlePreferencesContinue}
        onBack={() => setStep('welcome')}
      />
    );
  }

  if (step === 'dates') {
    return (
      <TripDatesScreen
        onContinue={handleDatesComplete}
        onSkip={handleSkip}
        onBack={() => setStep('preferences')}
      />
    );
  }

  return null;
}
