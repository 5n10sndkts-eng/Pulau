# Story 10.1: Create Checkout Flow Navigation

Status: ready-for-dev

## Story

As a traveler ready to book,
I want a clear multi-step checkout process,
So that I can complete my booking with confidence.

## Acceptance Criteria

**AC #1: Display 4-step progress indicator**
**Given** I tap "Continue to Booking" from trip builder
**When** checkout flow initiates
**Then** I see a 4-step progress indicator at top:
  - Step 1: Review (active)
  - Step 2: Traveler Details
  - Step 3: Payment
  - Step 4: Confirmation
**And** progress bar fills as I advance through steps

**AC #2: Show step status with icons**
**And** step labels show: completed (checkmark), current (filled circle), upcoming (empty circle)

**AC #3: Allow backward navigation**
**And** I can tap completed steps to go back
**And** I cannot skip ahead to future steps

**AC #4: Persist checkout state**
**And** checkout state persists to session (survives page refresh)

## Tasks / Subtasks

### Task 1: Create CheckoutFlow container component (AC: #1, #2, #3, #4)
- [ ] Build CheckoutFlow component managing step state
- [ ] Initialize with currentStep state (1-4)
- [ ] Add StepProgressIndicator to header
- [ ] Render appropriate step component based on currentStep
- [ ] Add prev/next navigation functions

### Task 2: Implement StepProgressIndicator component (AC: #1, #2)
- [ ] Create visual progress bar with 4 steps
- [ ] Display step numbers and labels
- [ ] Show status icons: checkmark (completed), filled circle (current), empty circle (upcoming)
- [ ] Fill progress bar based on current step (25%, 50%, 75%, 100%)
- [ ] Style with teal primary color for active/completed steps

### Task 3: Add step navigation logic (AC: #3)
- [ ] Implement nextStep() function advancing to next step
- [ ] Implement goToStep(stepNumber) allowing backward navigation
- [ ] Prevent forward skipping: only allow navigating to current or completed steps
- [ ] Mark steps as completed when moving forward
- [ ] Validate current step before allowing navigation

### Task 4: Persist checkout state with useKV (AC: #4)
- [ ] Store checkout session data in useKV: { currentStep, formData, tripSnapshot }
- [ ] Save state on every step change
- [ ] Restore state on component mount if session exists
- [ ] Clear session after successful booking completion
- [ ] Add session expiry timestamp (24 hours)

### Task 5: Build step routing and component rendering (AC: #1)
- [ ] Create switch/router for step components
- [ ] Step 1: render TripReviewStep
- [ ] Step 2: render TravelerDetailsStep
- [ ] Step 3: render PaymentStep
- [ ] Step 4: render ConfirmationStep
- [ ] Add smooth fade transition between steps (200ms)

## Dev Notes

### Technical Guidance
- Checkout state: use `useKV<CheckoutSession>('checkout_session', null)`
- Progress indicator: use Tailwind's `w-[25%]` for progress width
- Step validation: block nextStep() if current step form is invalid
- Session expiry: check timestamp on mount, clear if > 24 hours old
- Animations: Framer Motion's AnimatePresence for step transitions

### Checkout Session Data Structure
```typescript
interface CheckoutSession {
  currentStep: 1 | 2 | 3 | 4;
  completedSteps: number[];
  tripSnapshot: Trip; // Snapshot of trip at checkout start
  travelerDetails: TravelerDetails | null;
  paymentMethodId: string | null;
  createdAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp (24 hours from created)
}
```

### Step Progress Indicator
```typescript
const StepProgressIndicator = ({ currentStep, completedSteps, onStepClick }) => {
  const steps = [
    { number: 1, label: "Review" },
    { number: 2, label: "Details" },
    { number: 3, label: "Payment" },
    { number: 4, label: "Confirm" }
  ];

  return (
    <div className="step-progress">
      <div className="progress-bar" style={{ width: `${(currentStep / 4) * 100}%` }} />
      {steps.map(step => (
        <StepIndicator
          key={step.number}
          {...step}
          status={
            completedSteps.includes(step.number) ? 'completed' :
            step.number === currentStep ? 'current' : 'upcoming'
          }
          onClick={() => canNavigateToStep(step.number) && onStepClick(step.number)}
        />
      ))}
    </div>
  );
};
```

### Navigation Logic
```typescript
const useCheckoutNavigation = () => {
  const [session, setSession] = useKV<CheckoutSession>('checkout_session');
  const [currentStep, setCurrentStep] = useState(session?.currentStep || 1);
  const [completedSteps, setCompletedSteps] = useState<number[]>(session?.completedSteps || []);

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < 4) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
      setCurrentStep(prev => prev + 1);
      saveSession();
    }
  };

  const goToStep = (stepNumber: number) => {
    if (stepNumber <= currentStep || completedSteps.includes(stepNumber)) {
      setCurrentStep(stepNumber);
      saveSession();
    }
  };

  return { currentStep, completedSteps, nextStep, goToStep };
};
```

### Visual Specifications
- Progress bar: height 4px, teal color, rounded ends
- Step icons: 32px diameter circles
- Completed icon: checkmark in green circle
- Current icon: filled teal circle
- Upcoming icon: gray outline circle
- Step labels: 12px font, gray (upcoming), teal (current/completed)
- Spacing: steps evenly distributed across width

## References

- [Source: planning-artifacts/epics/epic-10.md#Epic 10, Story 10.1]
- [Source: prd/pulau-prd.md#Multi-Step Checkout Flow]
- [Figma: Checkout Flow Progress Indicator]
- [Technical: Form State Management Patterns]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
