import { CheckoutStep } from './CheckoutFlow';
import { Check } from 'lucide-react';

interface CheckoutProgressProps {
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  onStepClick: (step: CheckoutStep) => void;
}

const steps = [
  { id: 'review' as CheckoutStep, label: 'Review', number: 1 },
  { id: 'details' as CheckoutStep, label: 'Details', number: 2 },
  { id: 'payment' as CheckoutStep, label: 'Payment', number: 3 },
  { id: 'confirmation' as CheckoutStep, label: 'Confirmation', number: 4 },
];

export function CheckoutProgress({
  currentStep,
  completedSteps,
  onStepClick,
}: CheckoutProgressProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = step.id === currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => onStepClick(step.id)}
                className={`flex flex-col items-center gap-2 relative transition-all ${
                  isCompleted || isCurrent
                    ? 'opacity-100 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                disabled={!isCompleted && !isCurrent}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.number}
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-2 relative"
                  style={{ top: '-20px' }}
                >
                  <div className="absolute inset-0 bg-muted" />
                  <div
                    className={`absolute inset-0 bg-primary transition-all duration-300 ${
                      index < currentIndex ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
