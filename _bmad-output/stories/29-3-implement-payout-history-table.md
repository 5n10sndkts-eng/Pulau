# Story 29.3: Implement Payout History Table

Status: done

## Story

As a **vendor**,
I want to see a detailed history of all my Stripe Connect payouts with status, amounts, and fees,
So that I can track my earnings and understand when money will arrive in my bank account.

## Acceptance Criteria

1. **Given** I am logged in as a vendor with completed Stripe onboarding
   **When** I navigate to the Revenue Dashboard
   **Then** I see a "Payout History" section showing my payout records

2. **Given** I am viewing the payout history
   **When** I look at each payout row
   **Then** I see:
   - Payout status (pending, in_transit, paid, failed)
   - Amount (gross and net after fees)
   - Expected or actual arrival date
   - Payout ID/reference

3. **Given** I have many payouts
   **When** I scroll through the list
   **Then** I can load more via pagination or infinite scroll

4. **Given** I am viewing a payout
   **When** I click on a payout row or action button
   **Then** I can access the Stripe Dashboard for more details

5. **Given** I am viewing the payout history
   **When** I want to export my payout data
   **Then** I see an export option (CSV download)

## Tasks / Subtasks

- [x] Create Story 29-3 story file
- [x] Research existing Stripe Connect integration
- [x] Extend vendorAnalyticsService with payout history functions
  - [x] Add PayoutRecord interface
  - [x] Add PayoutHistoryResponse interface
  - [x] Create getPayoutHistory function (calls edge function)
  - [x] Add mock data generator for dev mode
- [x] Create PayoutHistoryTable component
  - [x] Create table layout with status, amount, date columns
  - [x] Add status badges with color coding
  - [x] Format amounts as currency
  - [x] Format dates with relative time
  - [x] Add skeleton loading state
  - [x] Add empty state for no payouts
- [x] Add pagination support
  - [x] Implement cursor-based or offset pagination
  - [x] Add "Load More" button or infinite scroll
- [x] Add Stripe Dashboard link
  - [x] Button to open Stripe Express dashboard
- [x] Add CSV export functionality
  - [x] Create export button
  - [x] Generate CSV from payout data
  - [x] Trigger download
- [x] Integrate into VendorRevenueDashboard
  - [x] Add PayoutHistoryTable below Experience Performance
  - [x] Pass vendor session

## Dev Notes

### Architecture

**Existing Infrastructure:**
- `vendor-payout-status` edge function already fetches payouts from Stripe
- Returns `PayoutStatus` with pending, scheduled, completed arrays
- Each payout has: amount, currency, arrival_date, stripe_transfer_id

**Data Flow:**
```
VendorRevenueDashboard
  → PayoutHistoryTable
    → useQuery → vendorAnalyticsService.getPayoutHistory()
      → supabase.functions.invoke('vendor-payout-status')
        → Stripe API (via Edge Function)
```

**Payout States (Stripe):**
- `pending` - Payout created, not yet processed
- `in_transit` - Money is on its way to bank
- `paid` - Successfully deposited
- `failed` - Payout failed (rare)
- `canceled` - Payout was canceled

### TypeScript Interfaces

```typescript
export interface PayoutRecord {
  id: string
  amount: number      // in cents
  currency: string    // 'usd', 'idr'
  status: 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled'
  arrivalDate: Date   // expected or actual
  createdAt: Date
  stripePayoutId: string
}

export interface PayoutHistoryResponse {
  payouts: PayoutRecord[]
  hasMore: boolean
  nextCursor?: string
}
```

### Component Structure

```
PayoutHistoryTable.tsx
├── Header with title and export button
├── Table
│   ├── Header row (Status, Amount, Date, Actions)
│   └── Body rows (PayoutRow for each payout)
├── Load More button (if hasMore)
└── Stripe Dashboard link
```

### File Changes

**Files to Modify:**
- `src/lib/vendorAnalyticsService.ts` - Add payout history functions
- `src/components/vendor/VendorRevenueDashboard.tsx` - Integrate table

**Files to Create:**
- `src/components/vendor/PayoutHistoryTable.tsx` - Main component

### References

- [Source: supabase/functions/vendor-payout-status/index.ts - Existing edge function]
- [Source: src/lib/vendorOnboardService.ts - Payment status functions]
- [Stripe Payout API: https://stripe.com/docs/api/payouts]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created PayoutHistoryTable component with full feature set
- Extended vendorAnalyticsService with PayoutRecord, PayoutHistoryResponse types
- Implemented getPayoutHistory function with mock data and Stripe edge function integration
- Added StatusBadge component with color-coded icons (Completed=green, In Transit=blue, Pending=yellow)
- Implemented summary cards showing totals by payout status
- Added relative date formatting (Yesterday, 1 week ago, etc.)
- Implemented CSV export with downloadable file
- Added Stripe Dashboard link button
- Implemented "Load More" pagination
- Browser tested: all features working correctly

### File List

- `src/components/vendor/PayoutHistoryTable.tsx` (created)
- `src/lib/vendorAnalyticsService.ts` (extended with payout history)
- `src/components/vendor/VendorRevenueDashboard.tsx` (integrated table)
