# Story 10.8: Session Persistence for Incomplete Bookings

Status: done

## Story

As a traveler who gets interrupted during checkout,
I want my progress saved,
So that I can resume where I left off.

## Acceptance Criteria

**AC #1: Save checkout progress automatically**
**Given** I am partway through checkout and close the bobjectser/app
**When** I return to the app within 24 hours
**Then** I see a prompt: "Continue your booking?"

**AC #2: Restore checkout session**
**And** my checkout progress is restored (step, form data, trip items)
**And** checkout session stored in Spark useKV with expiry timestamp

**AC #3: Clear expired sessions**
**When** session is older than 24 hours
**Then** session is cleared
**And** user starts fresh from trip builder

**AC #4: Clear session on completion or cancellation**
**When** I complete booking or explicitly cancel
**Then** checkout session is cleared

## Tasks / Subtasks

### Task 1: Create checkout session data structure (AC: #1, #2)

- [x] Define CheckoutSession interface with all required fields
- [x] Include currentStep, completedSteps, form data, trip snapshot
- [x] Add createdAt and expiresAt timestamps
- [x] Store session in useKV: 'checkout_session'
- [x] Initialize default session on checkout start

### Task 2: Implement auto-save on step changes (AC: #1)

- [x] Save session data on every step navigation
- [x] Save form data on continue button click
- [x] Update session.currentStep when advancing
- [x] Mark steps as completed in session.completedSteps
- [x] Debounce rapid saves (100ms) to avoid excessive writes

### Task 3: Create session restoration prompt (AC: #1, #2)

- [x] Check for existing session on app load
- [x] Display "Continue your booking?" modal if session exists
- [x] Show trip summary and last step completed
- [x] Add "Continue" and "Start Fresh" buttons
- [x] On "Continue": restore session and navigate to last step

### Task 4: Implement session expiry check (AC: #3)

- [x] Check session.expiresAt on app load
- [x] Compare with current timestamp
- [x] Clear session if expired (> 24 hours old)
- [x] Show message: "Your checkout session has expired. Please start again."
- [x] Remove expired session from useKV

### Task 5: Clear session on booking completion or cancellation (AC: #4)

- [x] Clear session on reaching Step 4 (Confirmation)
- [x] Clear session if user explicitly cancels checkout
- [x] Clear session if user edits trip and abandons checkout
- [x] Add "Cancel Checkout" button in header
- [x] Confirm cancellation with modal: "Are you sure you want to cancel?"

## Dev Notes

### Technical Guidance

- Session storage: Spark's `useKV<CheckoutSession>('checkout_session', null)`
- Expiry: set expiresAt = createdAt + 24 hours
- Restoration: check session on component mount with useEffect
- Clear: set session to null in useKV
- Auto-save: debounce with lodash or custom hook

### Checkout Session Data Structure

```typescript
interface CheckoutSession {
  currentStep: 1 | 2 | 3 | 4;
  completedSteps: number[];
  tripSnapshot: Trip; // Snapshot of trip at checkout start
  travelerDetails: TravelerDetailsFormData | null;
  paymentMethodId: string | null;
  createdAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp (24 hours from created)
}

const createCheckoutSession = (trip: Trip): CheckoutSession => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 hours

  return {
    currentStep: 1,
    completedSteps: [],
    tripSnapshot: JSON.parse(JSON.stringify(trip)), // Deep copy
    travelerDetails: null,
    paymentMethodId: null,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
};
```

### Session Restoration Logic

```typescript
const useCheckoutSessionRestoration = () => {
  const [session, setSession] = useKV<CheckoutSession>(
    'checkout_session',
    null,
  );
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  useEffect(() => {
    if (session) {
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);

      if (now > expiresAt) {
        // Session expired
        setSession(null);
        toast.info('Your checkout session has expired');
      } else {
        // Session valid
        setShowRestorePrompt(true);
      }
    }
  }, []);

  const handleContinue = () => {
    setShowRestorePrompt(false);
    // Navigate to session.currentStep
    goToStep(session!.currentStep);
  };

  const handleStartFresh = () => {
    setSession(null);
    setShowRestorePrompt(false);
    // Start new checkout from step 1
  };

  return { showRestorePrompt, handleContinue, handleStartFresh };
};
```

### Auto-Save Implementation

```typescript
import { debounce } from 'lodash';

const saveCheckoutSession = debounce((session: CheckoutSession) => {
  setSession(session);
}, 100);

// Usage in checkout flow
const handleStepChange = (newStep: number) => {
  const updatedSession = {
    ...session,
    currentStep: newStep,
    completedSteps: [...session.completedSteps, currentStep],
  };
  saveCheckoutSession(updatedSession);
  setCurrentStep(newStep);
};
```

### Session Restoration Prompt Component

```typescript
<Dialog open={showRestorePrompt} onOpenChange={setShowRestorePrompt}>
  <DialogContent>
    <DialogHeader>Continue your booking?</DialogHeader>
    <DialogDescription>
      You have an incomplete booking for:
      <TripSummary>
        <div>{session.tripSnapshot.name}</div>
        <div>{session.tripSnapshot.items.length} experiences</div>
        <div>Last on: Step {session.currentStep}</div>
      </TripSummary>
    </DialogDescription>
    <DialogFooter>
      <Button variant="outline" onClick={handleStartFresh}>
        Start Fresh
      </Button>
      <Button onClick={handleContinue}>
        Continue Booking
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Clear Session Scenarios

- Booking completed: `setSession(null)` on Step 4 mount
- User cancels: `setSession(null)` when "Cancel Checkout" clicked
- Trip edited: `setSession(null)` if user modifies trip during checkout
- Explicit logout: `setSession(null)` on logout
- Session expired: automatic cleanup on next app load

## References

- [Source: planning-artifacts/epics/epic-10.md#Epic 10, Story 10.8]
- [Source: prd/pulau-prd.md#Session Persistence]
- [Related: Story 10.1 - Create Checkout Flow Navigation]
- [Technical: Spark useKV Documentation]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations
