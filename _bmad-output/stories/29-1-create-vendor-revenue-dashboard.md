# Story 29.1: Create Vendor Revenue Dashboard

Status: done

## Story

As a **vendor**,
I want to see a dashboard displaying my total revenue, pending payouts, and completed payouts,
So that I can track my business performance and understand my earnings at a glance.

## Acceptance Criteria

1. **Given** I am logged in as a vendor with active payments
   **When** I navigate to my dashboard or revenue section
   **Then** I see a revenue dashboard showing:
   - Total revenue (all time and this month)
   - Pending payouts (amounts awaiting transfer)
   - Completed payouts (amounts already transferred)

2. **Given** I am viewing the revenue dashboard
   **When** I select a time period filter (daily/weekly/monthly)
   **Then** the revenue chart updates to show trends for that period
   **And** I can see comparison with previous period

3. **Given** I have multiple experiences
   **When** I filter by experience
   **Then** the revenue data updates to show only that experience's earnings
   **And** date range filter works in combination with experience filter

4. **Given** I have confirmed bookings
   **When** viewing the revenue chart
   **Then** I see selectable time periods (7 days, 30 days, 90 days, 12 months)
   **And** each data point shows date and amount on hover

## Tasks / Subtasks

- [x] Create revenue dashboard page structure (AC: 1)
  - [x] Create `VendorRevenueDashboard.tsx` component
  - [x] Add route `/vendor/revenue` to App.tsx
  - [x] Add navigation link from VendorDashboard
  - [x] Design responsive card layout for metrics

- [x] Build revenue summary cards (AC: 1)
  - [x] Create `RevenueSummaryCard.tsx` component
  - [x] Display total revenue (all time)
  - [x] Display revenue this month
  - [x] Display pending payouts (from Stripe Connect)
  - [x] Display completed payouts (from Stripe Connect)
  - [x] Add trend indicators (vs previous period)

- [x] Create vendor analytics service (AC: 1, 2, 3)
  - [x] Create `src/lib/vendorAnalyticsService.ts`
  - [x] Implement `getVendorRevenueStats(vendorId)` function
  - [x] Implement `getRevenueByDateRange(vendorId, startDate, endDate, experienceId?)`
  - [x] Implement `getPayoutSummary(vendorId)` using vendor-payout-status edge function
  - [x] Add TypeScript interfaces for analytics data

- [x] Implement revenue chart component (AC: 2, 4)
  - [x] Create `RevenueChart.tsx` using Recharts or similar
  - [x] Show line/bar chart with revenue over time
  - [x] Support daily, weekly, monthly aggregation
  - [x] Add hover tooltips showing date and amount
  - [x] Add responsive sizing for mobile

- [x] Add time period selector (AC: 2, 4)
  - [x] Create period selector pills/tabs (7d, 30d, 90d, 12m)
  - [x] Store selected period in component state
  - [x] Re-fetch data when period changes
  - [x] Show date range in human-readable format

- [x] Add experience filter (AC: 3)
  - [x] Create experience dropdown selector
  - [x] Fetch vendor's experiences list
  - [x] Include "All Experiences" option
  - [x] Update chart and metrics when filter changes

- [x] Add period comparison (AC: 2)
  - [x] Calculate previous period metrics
  - [x] Show percentage change (+12%, -5%, etc.)
  - [x] Color code increases (green) vs decreases (red)

## Dev Notes

### Architecture Patterns

**Data Sources:**
- Bookings revenue: `payments` table joined with `bookings`
- Payout data: Stripe Connect API via `vendor-payout-status` edge function
- Already have `vendorOnboardService.getVendorPaymentStatus()` that can be extended

**Revenue Calculation:**
```sql
-- Total revenue for vendor
SELECT SUM(p.amount) as total_revenue
FROM payments p
JOIN bookings b ON p.booking_id = b.id
JOIN trip_items ti ON ti.trip_id = b.trip_id
JOIN experiences e ON ti.experience_id = e.id
WHERE e.vendor_id = $vendor_id
  AND p.status = 'succeeded'
```

**Chart Library:**
- Recommended: `recharts` (already may be in project, React-native)
- Alternative: `react-chartjs-2` with Chart.js
- Keep charts simple: LineChart or BarChart

**Stripe Connect Payout Data:**
- `payouts.list()` API to get payout history
- Filter by `status: 'paid'` vs `status: 'pending'`
- Sum amounts for pending/completed totals

### Code Quality Requirements

**TypeScript Interfaces:**
```typescript
interface VendorRevenueStats {
  totalRevenue: number
  revenueThisMonth: number
  pendingPayouts: number
  completedPayouts: number
  periodComparison: {
    previousPeriod: number
    percentChange: number
  }
}

interface RevenueDataPoint {
  date: string // ISO date
  amount: number
  bookingCount: number
}

interface RevenueDateRange {
  startDate: string
  endDate: string
  experienceId?: string
  granularity: 'day' | 'week' | 'month'
}
```

**React Patterns:**
- Use TanStack Query for data fetching with caching
- Use `useQuery` with appropriate staleTime for analytics
- Loading skeletons for chart and cards
- Error boundary for chart rendering failures

**Responsive Design:**
- Cards stack vertically on mobile
- Chart resizes to container width
- Touch-friendly filter controls

### File Structure

**Files to Create:**
- `src/components/vendor/VendorRevenueDashboard.tsx` - Main dashboard page
- `src/components/vendor/RevenueSummaryCard.tsx` - Individual metric card
- `src/components/vendor/RevenueChart.tsx` - Time series chart
- `src/lib/vendorAnalyticsService.ts` - Analytics data service

**Files to Modify:**
- `src/App.tsx` - Add `/vendor/revenue` route
- `src/components/vendor/VendorDashboard.tsx` - Add link to revenue page
- `src/lib/types.ts` - Add analytics type definitions

**Dependencies to Add (if not present):**
```json
{
  "recharts": "^2.12.0"
}
```

### Edge Function Integration

Extend existing `vendor-payout-status` edge function or create new analytics endpoint:
- Query Stripe Connect for payout balance
- Query payments table for revenue aggregation
- Return combined analytics response

### Testing Requirements

**Manual Testing:**
- Verify revenue totals match actual bookings
- Test time period filters update chart correctly
- Test experience filter narrows data correctly
- Test empty state (new vendor with no bookings)
- Test loading states and error handling

**Test Scenarios:**
- Vendor with 0 bookings → show empty state
- Vendor with bookings but no completed payouts → pending > 0, completed = 0
- Vendor with mixed experiences → filter works correctly
- Period change → chart re-renders smoothly

### Project Structure Notes

**Alignment with Architecture:**
- Part of Epic 29: Vendor Analytics & Payout Dashboard
- Builds on Epic 22 (Stripe Connect) and Epic 27 (Vendor Operations)
- Uses existing vendor authentication from Epic 3/22
- Extends vendor dashboard from VendorDashboard.tsx

**Integration Points:**
- Uses vendor auth session from AuthContext
- Calls vendorOnboardService for Stripe payout data
- Queries payments/bookings tables for revenue data
- Follows design patterns from existing VendorDashboard

**Existing Code to Leverage:**
- `src/components/vendor/VendorDashboard.tsx:100-107` - Stats calculation pattern
- `src/lib/vendorOnboardService.ts` - Stripe Connect integration
- `supabase/functions/vendor-payout-status/` - Edge function pattern

### References

- [Source: _bmad-output/planning-artifacts/phase-2b-epics.md#Epic-29-Story-29.1]
- [Source: src/components/vendor/VendorDashboard.tsx - Existing vendor stats pattern]
- [Source: src/lib/vendorOnboardService.ts - Stripe integration]
- [Recharts Documentation: https://recharts.org/]
- [Stripe Connect Payouts API: https://stripe.com/docs/api/payouts]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A - Recharts integration.

### Completion Notes List

**Implementation Summary:**
1. Created vendorAnalyticsService.ts with:
   - Type definitions (VendorRevenueStats, RevenueDataPoint, PayoutSummary, TimePeriod)
   - `getVendorRevenueStats()` - fetches revenue summary with period comparison
   - `getRevenueByDateRange()` - fetches chart data with granularity support
   - `getPayoutSummary()` - fetches payout data from vendor-payout-status edge function
   - Helper functions for date ranges and currency formatting
   - Mock data mode for development

2. Created VendorRevenueDashboard.tsx with:
   - RevenueSummaryCard component with loading skeletons
   - Custom ChartTooltip component for hover details
   - Responsive stats grid (1-2-4 columns)
   - Time period selector pills (7d, 30d, 90d, 12m)
   - Experience filter dropdown using Select component
   - Line/Bar chart toggle
   - Period comparison card with color-coded changes
   - TanStack Query for data fetching with 5-min cache

3. Route integration:
   - Added `/vendor/revenue` route in App.tsx
   - Made Revenue card clickable in VendorDashboard.tsx
   - Added `onNavigateToRevenue` prop for navigation

4. Chart features:
   - Recharts LineChart and BarChart with responsive container
   - CartesianGrid, XAxis, YAxis formatting
   - Custom tooltip with date, amount, booking count
   - Dynamic date formatting based on time period

### File List

**Created Files:**
- src/lib/vendorAnalyticsService.ts
- src/components/vendor/VendorRevenueDashboard.tsx
- src/components/vendor/RevenueSummaryCard.tsx (code review fix: extracted from inline)
- src/components/vendor/RevenueChart.tsx (code review fix: extracted from inline)

**Modified Files:**
- src/App.tsx (added import and route)
- src/components/vendor/VendorDashboard.tsx (added navigation prop and clickable card)

### Code Review Record

**Reviewed:** 2026-01-11
**Reviewer:** Claude Opus 4.5

**Issues Found:** 11 total (4 HIGH, 5 MEDIUM, 2 LOW)

**Issues Fixed:**
1. [HIGH] Extracted RevenueSummaryCard to separate component file (was inline)
2. [HIGH] Extracted RevenueChart to separate component file (was inline)
3. [MEDIUM] Fixed `any` type in ChartTooltip - now uses proper TooltipProps typing
4. [MEDIUM] Fixed error handling in vendorAnalyticsService - now returns default stats instead of throwing
5. [MEDIUM] Connected payout data to getPayoutSummary() instead of hardcoded approximation

**Additional Fixes Applied (2nd Code Review Pass):**
6. [HIGH] Fixed period comparison calculation - getPreviousPeriodRange() now called properly
7. [HIGH] Fixed Supabase nested join query - refactored to use simpler queries with app-side filtering
8. [HIGH] Added ErrorBoundary to RevenueChart with ChartErrorFallback component
9. [HIGH] Fixed experienceId filter - now passed to getVendorRevenueStats()
10. [MEDIUM] Added accessibility attributes (role="tablist", aria-selected, aria-pressed, aria-label)
11. [MEDIUM] Documented cents assumption in formatCurrency JSDoc
12. [MEDIUM] Added refresh loading state with spinning icon and disabled button
13. [HIGH] Created unit tests for vendorAnalyticsService (21 tests passing)

**Files Created (2nd pass):**
- src/lib/vendorAnalyticsService.test.ts (21 unit tests)

