# Story 8.10: Real-Time Price Calculation Display

Status: done

## Story

As a traveler,
I want to see my trip total update in real-time,
So that I always know my current spend.

## Acceptance Criteria

**AC #1: Display price breakdown**
**Given** I have items in my trip
**When** viewing any trip context (canvas, builder, or checkout)
**Then** price breakdown shows:

- Subtotal: SUM(each item's price × guest_count)
- Service Fee: subtotal × 0.10 (10%)
- Total: subtotal + service_fee
  **And** all prices formatted with currency symbol (e.g., "$125.00")

**AC #2: Update prices in real-time**
**When** I add, remove, or adjust guest count
**Then** all price values update within 100ms
**And** animations highlight changed values briefly

## Tasks / Subtasks

### Task 1: Create price calculation utility functions (AC: #1)

- [x] Implement calculateSubtotal: sum of all item prices × guest counts
- [x] Implement calculateServiceFee: subtotal × 0.10
- [x] Implement calculateTotal: subtotal + service fee
- [x] Add formatPrice utility: formats number as currency string
- [x] Export functions from shared utils for reuse

### Task 2: Build PriceSummary component (AC: #1)

- [x] Create PriceSummary component displaying all three values
- [x] Show subtotal, service fee, and total with labels
- [x] Format all prices with currency symbol and 2 decimals
- [x] Style with clear hierarchy (total emphasized)
- [x] Add divider line between fee and total

### Task 3: Integrate price calculations in trip context (AC: #1, #2)

- [x] Add useMemo to calculate prices whenever trip.items changes
- [x] Recalculate on: item add, remove, guest count change
- [x] Ensure calculations run within 100ms (no blocking)
- [x] Handle edge cases: empty trip, invalid prices
- [x] Test with large trip (50+ items) for performance

### Task 4: Add price change highlight animations (AC: #2)

- [x] Detect when price values change (use useEffect)
- [x] Apply pulse/highlight animation to changed value
- [x] Use teal color for highlight (primary brand color)
- [x] Animation duration: 300ms
- [x] Remove highlight after animation completes

### Task 5: Display PriceSummary in all trip contexts (AC: #1)

- [x] Add to TripCanvasHome footer
- [x] Add to TripBuilder sticky footer
- [x] Add to Checkout review step
- [x] Ensure consistent formatting across all contexts
- [x] Test price sync across simultaneous views (if applicable)

## Dev Notes

### Technical Guidance

- Use `useMemo` for expensive calculations to prevent re-renders
- Price format: use `Intl.NumberFormat` for locale-aware currency formatting
- Service fee rate: configurable constant (10% = 0.10)
- Highlight animation: Framer Motion's `animate` prop or CSS keyframe
- Prices should always show 2 decimal places

### Price Calculation Functions

```typescript
const calculateSubtotal = (
  items: TripItem[],
  experiences: Experience[],
): number => {
  return items.reduce((sum, item) => {
    const experience = experiences.find((exp) => exp.id === item.experience_id);
    if (!experience) return sum;
    return sum + experience.price * item.guest_count;
  }, 0);
};

const calculateServiceFee = (
  subtotal: number,
  feeRate: number = 0.1,
): number => {
  return subtotal * feeRate;
};

const calculateTotal = (subtotal: number, serviceFee: number): number => {
  return subtotal + serviceFee;
};

const formatPrice = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
```

### PriceSummary Component

```typescript
<PriceSummary>
  <PriceRow label="Subtotal" amount={formatPrice(subtotal)} />
  <PriceRow label="Service Fee (10%)" amount={formatPrice(serviceFee)} />
  <Divider />
  <PriceRow
    label="Total"
    amount={formatPrice(total)}
    emphasized
    animated={priceChanged}
  />
</PriceSummary>
```

### Animation Configuration

```typescript
const priceHighlight = {
  initial: { backgroundColor: 'transparent' },
  animate: {
    backgroundColor: ['transparent', '#0D737720', 'transparent'],
    transition: { duration: 0.3, times: [0, 0.5, 1] },
  },
};
```

### Performance Considerations

- Memoize calculations to avoid re-computing on every render
- Debounce rapid changes (e.g., holding down guest count stepper)
- Use React.memo for PriceSummary to prevent unnecessary re-renders
- Test with 50+ items to ensure sub-100ms calculation time

## References

- [Source: planning-artifacts/epics/epic-08.md#Epic 8, Story 8.10]
- [Source: prd/pulau-prd.md#Real-Time Pricing]
- [Related: Story 8.7 - Add Guest Count Adjustment per Item]
- [Related: Story 8.8 - Implement Remove Item from Trip]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations
