/**
 * Trip Dates Screen (Onboarding Step 3/3)
 * Epic 4, Story 4.3: Add Optional Trip Dates Screen
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TripDatesScreenProps {
  onContinue: (dates: { startDate?: string; endDate?: string }) => void;
  onSkip: () => void;
  onBack: () => void;
}

export function TripDatesScreen({
  onContinue,
  onSkip,
  onBack,
}: TripDatesScreenProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const today = new Date().toISOString().split('T')[0];
  const minEndDate = startDate
    ? new Date(new Date(startDate).getTime() + 86400000)
        .toISOString()
        .split('T')[0]
    : today;

  const handleContinue = () => {
    if (startDate && endDate) {
      onContinue({ startDate, endDate });
    } else {
      onSkip();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-6 py-4 shadow-sm">
        <div className="text-center text-sm font-medium text-slate-600">
          3 of 3
        </div>
        <h2 className="mt-2 text-center text-2xl font-bold text-slate-900">
          When Are You Visiting?
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Optional - helps us show available experiences
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md space-y-6"
        >
          {/* Illustration */}
          <div className="flex justify-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-teal-100">
              <Calendar className="h-16 w-16 text-teal-600" />
            </div>
          </div>

          {/* Date Inputs */}
          <div className="space-y-4">
            {/* Arrival Date */}
            <div className="space-y-2">
              <Label
                htmlFor="arrival-date"
                className="text-base font-medium text-slate-900"
              >
                Arrival Date
              </Label>
              <Input
                id="arrival-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
                className="h-12 text-base"
              />
            </div>

            {/* Departure Date */}
            <div className="space-y-2">
              <Label
                htmlFor="departure-date"
                className="text-base font-medium text-slate-900"
              >
                Departure Date
              </Label>
              <Input
                id="departure-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={minEndDate}
                disabled={!startDate}
                className="h-12 text-base disabled:cursor-not-allowed disabled:opacity-50"
              />
              {!startDate && (
                <p className="text-sm text-slate-500">
                  Select an arrival date first
                </p>
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              💡 You can always add or change your dates later in your trip
              planner.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 border-t bg-white px-6 py-4">
        <div className="mx-auto max-w-md space-y-3">
          <div className="flex gap-3">
            <Button onClick={onBack} variant="outline" className="flex-1">
              Back
            </Button>
            <Button
              onClick={handleContinue}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              {startDate && endDate ? 'Continue' : 'Skip for Now'}
            </Button>
          </div>
          {!startDate && !endDate && (
            <button
              onClick={onSkip}
              className="w-full text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Skip for now - Just browsing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
