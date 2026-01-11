# Story 29.4: Create Booking Funnel Analytics

Status: done

## Story

As a **vendor**,
I want to see a funnel visualization showing how travelers move from viewing my experiences to completing bookings,
So that I can identify drop-off points and optimize my listings to improve conversion rates.

## Acceptance Criteria

1. **Given** I am logged in as a vendor with experiences
   **When** I view the Revenue Dashboard
   **Then** I see a booking funnel visualization

2. **Given** I am viewing the booking funnel
   **When** I look at the funnel stages
   **Then** I see:
   - Views (experience page visits)
   - Add to Trip (added to cart)
   - Checkout Started
   - Booking Confirmed
   - With counts and conversion percentages at each stage

3. **Given** I have booking funnel data
   **When** I look at conversion rates
   **Then** I see percentage drop-offs between each stage

4. **Given** I am viewing the funnel
   **When** I select a time period filter
   **Then** the funnel data updates for that period

5. **Given** I am viewing the funnel
   **When** I look at the visualization
   **Then** I see a clear visual representation of the funnel narrowing

## Tasks / Subtasks

- [x] Create Story 29-4 story file
- [x] Research booking funnel data sources
- [x] Extend vendorAnalyticsService with funnel functions
  - [x] Add FunnelStage interface
  - [x] Add FunnelData interface
  - [x] Create getBookingFunnel function
  - [x] Add mock data generator for dev mode
- [x] Create BookingFunnelChart component
  - [x] Create funnel visualization using Recharts
  - [x] Display stage labels with counts
  - [x] Show conversion percentages between stages
  - [x] Add drop-off indicators
  - [x] Add skeleton loading state
- [x] Integrate into VendorRevenueDashboard
  - [x] Add BookingFunnelChart component
  - [x] Connect to time period filter
- [x] Test and commit

## Dev Notes

### Data Sources

**Funnel Stages:**
1. **Views** - Experience page visits (would need analytics tracking)
2. **Add to Trip** - Items added to trip (trip_items table)
3. **Checkout Started** - Checkout initiated (bookings with status pending)
4. **Booking Confirmed** - Completed bookings (bookings with status confirmed + payment succeeded)

**Note:** For MVP, we'll use mock data since view tracking isn't implemented. Real implementation would require:
- Analytics events for page views
- Event tracking for add-to-trip actions
- Checkout initiation tracking

### TypeScript Interfaces

```typescript
export interface FunnelStage {
  name: string
  value: number
  fill: string
}

export interface FunnelData {
  stages: FunnelStage[]
  conversionRates: {
    viewsToAddToTrip: number
    addToTripToCheckout: number
    checkoutToConfirmed: number
    overallConversion: number
  }
}
```

### Component Structure

```
BookingFunnelChart.tsx
├── Funnel visualization (Recharts FunnelChart or custom)
├── Stage labels with counts
├── Conversion rate badges between stages
├── Overall conversion summary
└── Skeleton loading state
```

### Recharts Funnel

Recharts has a FunnelChart component that can be used:
```typescript
import { FunnelChart, Funnel, Cell, LabelList, Tooltip } from 'recharts'
```

### References

- [Source: _bmad-output/planning-artifacts/phase-2b-epics.md#Epic-29-Story-29.4]
- [Recharts Funnel: https://recharts.org/en-US/api/FunnelChart]
- [Source: src/lib/vendorAnalyticsService.ts - Extend this service]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Implemented FunnelStage and FunnelData interfaces with conversionFromPrevious for stage-by-stage conversion rates
- Created mock data generator with realistic conversion rates (Views→Add: 15-25%, Add→Checkout: 40-60%, Checkout→Confirm: 70-85%)
- Built BookingFunnelChart using Recharts FunnelChart with custom labels, tooltips, and conversion badges
- Added StageDetails component showing each stage with icons (Eye, ShoppingCart, CreditCard, CheckCircle)
- Integrated time period filter support (7d, 30d, 90d, 12m)
- Added skeleton loading and empty state handling

### File List

- src/lib/vendorAnalyticsService.ts (extended with funnel types and functions)
- src/components/vendor/BookingFunnelChart.tsx (new)
- src/components/vendor/VendorRevenueDashboard.tsx (integrated component)
