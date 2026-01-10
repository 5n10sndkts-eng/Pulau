# Story 24.2: Build Checkout Review Screen

Status: done

## Story

As a **traveler**,
I want to review my trip before payment,
So that I can verify all details are correct.

## Acceptance Criteria

1. **Given** I have items in my trip and click "Checkout"
   **When** the checkout review screen loads
   **Then** I see:
     - List of all experiences with dates, times, guest counts
     - Price breakdown per item
     - Platform fees (if displayed)
     - Total amount
     - Cancellation policy summary for each item

2. **Given** I am on the checkout review screen
   **When** I want to modify my order
   **Then** I can remove items from checkout
   **And** I can adjust guest counts (if availability allows)

3. **Given** I am viewing the checkout review
   **When** availability changes while viewing
   **Then** I see real-time availability status (e.g., "2 spots left")
   **And** the UI updates if slots become unavailable

4. **Given** I am satisfied with my order
   **When** I click "Proceed to Payment"
   **Then** I am navigated to the payment screen (Story 24.3)

## Tasks / Subtasks

- [x] Task 1: Create CheckoutReview component structure (AC: #1)
  - [x] 1.1: Create `src/components/checkout/CheckoutReview.tsx` with basic layout
  - [x] 1.2: Add props interface for trip data and callbacks
  - [x] 1.3: Implement responsive mobile-first design using Tailwind
  - [x] 1.4: Add skeleton loading state while fetching trip details

- [x] Task 2: Build trip items display section (AC: #1)
  - [x] 2.1: Create `CheckoutItemCard` component for individual experience
  - [x] 2.2: Display experience image, title, date, time, guest count
  - [x] 2.3: Show price per item (unit price × guests)
  - [x] 2.4: Display cancellation policy summary badge for each item

- [x] Task 3: Implement price breakdown section (AC: #1)
  - [x] 3.1: Create `PriceBreakdown` component
  - [x] 3.2: Show subtotal (sum of all items)
  - [x] 3.3: Calculate and display platform fee if applicable
  - [x] 3.4: Show total amount prominently

- [x] Task 4: Add item modification capabilities (AC: #2)
  - [x] 4.1: Add "Remove" button to each item card
  - [x] 4.2: Implement guest count adjustment (+/- buttons)
  - [x] 4.3: Validate guest count against available_count from experience_slots
  - [x] 4.4: Update price breakdown reactively on changes

- [x] Task 5: Integrate real-time availability (AC: #3)
  - [x] 5.1: Subscribe to slot availability changes using realtimeService
  - [x] 5.2: Display "X spots left" indicator for low availability (<5)
  - [x] 5.3: Show warning banner if a slot becomes unavailable
  - [x] 5.4: Disable checkout if any item becomes unavailable

- [x] Task 6: Add checkout action (AC: #4)
  - [x] 6.1: Create prominent "Proceed to Payment" CTA button
  - [x] 6.2: Add loading state during checkout initiation
  - [x] 6.3: Call checkout Edge Function on click
  - [x] 6.4: Handle success (redirect to Stripe) and error states

## Dev Notes

### Architecture Patterns & Constraints

**Component Location:**
```
src/components/checkout/
  CheckoutReview.tsx       # Main review screen (this story)
  CheckoutItemCard.tsx     # Individual item display
  PriceBreakdown.tsx       # Price summary component
```

**Props Interface Pattern:**
```typescript
interface CheckoutReviewProps {
  tripId: string
  onBack: () => void
  onProceedToPayment: (sessionUrl: string) => void
}
```

**Discriminated Union Screen Routing (from project-context.md):**
```typescript
// In App.tsx, add new screen type
type Screen =
  | { type: 'checkout-review'; tripId: string }
  | { type: 'checkout-payment'; sessionUrl: string }
  // ... existing screens
```

**Data Fetching Pattern:**
```typescript
// Use TanStack Query hook
const { data: trip, isLoading, error } = useTrip(tripId)
const { data: tripItems } = useTripItems(tripId)
```

### Previous Story Intelligence (Story 24.1)

**From Story 24.1 (checkout Edge Function):**
- Checkout function expects `tripId` in request body
- Returns `{ success: true, sessionUrl: string }` on success
- Error codes: INSUFFICIENT_INVENTORY, VENDOR_NOT_PAYMENT_READY, CUTOFF_TIME_PASSED
- Single-vendor checkout only (MVP constraint)

**Key Learnings:**
- Multi-vendor trips should show warning before checkout
- Cutoff time validation happens server-side, but show client-side warning
- Price stored in cents - convert for display (price / 100)

### Technical Requirements

**Price Display Formatting:**
```typescript
// Helper in lib/helpers.ts
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}
```

**Real-Time Subscription Pattern:**
```typescript
// Using realtimeService from Epic 25 prep
useEffect(() => {
  const subscription = realtimeService.subscribeToSlotAvailability(
    experienceId,
    (payload) => {
      // Update local state with new availability
      setAvailability(payload.available_count)
    }
  )
  return () => subscription.unsubscribe()
}, [experienceId])
```

**Checkout API Call:**
```typescript
async function initiateCheckout(tripId: string): Promise<CheckoutResponse> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/checkout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tripId }),
  })
  return response.json()
}
```

### UX Requirements

**Mobile-First Design:**
- Stack items vertically on mobile
- Sticky price breakdown at bottom on mobile
- Touch-friendly buttons (44x44px minimum)

**Loading States:**
- Skeleton cards while loading trip data
- Button loading spinner during checkout initiation

**Error Handling:**
- Toast notifications for API errors
- Inline validation messages for guest count changes
- Full-screen error state if trip fetch fails

### File Structure Requirements

```
src/
  components/
    checkout/
      CheckoutReview.tsx      # Main component (this story)
      CheckoutItemCard.tsx    # Item card component
      PriceBreakdown.tsx      # Price summary
  lib/
    helpers.ts                # Add formatPrice helper
```

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Story 24.2]
- [Source: project-context.md#Component Data Pattern]
- [Source: project-context.md#Loading & Error State Conventions]
- [Source: _bmad-output/stories/24-1-create-checkout-edge-function.md#Technical Requirements]

### Testing Requirements

**Test Scenarios:**
1. ✅ Load checkout with valid trip → Shows all items with prices
2. ✅ Remove item → Updates total, removes from list
3. ✅ Adjust guest count → Updates item price and total
4. ✅ Exceed available count → Shows error, prevents increase
5. ✅ Slot becomes unavailable → Shows warning, disables checkout
6. ✅ Click Proceed to Payment → Calls checkout function, redirects on success
7. ✅ Checkout fails → Shows error toast with message

### Security Considerations

- Never trust client-side price calculations for final charge
- All prices validated server-side in checkout Edge Function
- Session token required for checkout initiation

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References
- TypeScript compilation: PASS
- Build: PASS
- Tests: 29/29 PASS

### Completion Notes List
1. Created CheckoutReview.tsx with complete implementation:
   - Main CheckoutReview component with trip review functionality
   - CheckoutItemCard subcomponent for individual experience display
   - PriceBreakdown subcomponent for price summary
   - CheckoutReviewSkeleton for loading state
2. Implemented real-time availability via Supabase postgres_changes subscription
3. Integrated with checkout Edge Function (Story 24.1)
4. Added comprehensive error handling for all checkout error codes
5. Mobile-first responsive design with sticky CTA button on mobile
6. Guest count modification with availability validation
7. Low availability warnings (< 5 spots)
8. Item removal with instant price recalculation

### Code Review Fixes (Post-Implementation)
1. Fixed real-time filter syntax for UUID arrays in PostgREST
   - Original: `filter: experience_id=in.(${ids.join(',')})`
   - Fixed: UUIDs now properly quoted and uses `eq` for single ID optimization

### File List
- src/components/checkout/CheckoutReview.tsx (CREATED, FIXED in code review)
- src/components/checkout/CheckoutReview.test.tsx (CREATED)

