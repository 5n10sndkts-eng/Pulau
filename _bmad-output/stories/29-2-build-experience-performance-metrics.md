# Story 29.2: Build Experience Performance Metrics

Status: done

## Story

As a **vendor**,
I want to see performance metrics for each of my experiences including booking count, conversion rate, average rating, and slot utilization,
So that I can identify my top-performing experiences and optimize underperforming ones.

## Acceptance Criteria

1. **Given** I am logged in as a vendor with multiple experiences
   **When** I navigate to the experience performance section
   **Then** I see a table showing all my experiences with performance metrics

2. **Given** I am viewing the experience performance table
   **When** I look at each experience row
   **Then** I see:
   - Experience title and thumbnail
   - Total booking count (all time and selected period)
   - Slot utilization percentage (booked slots / total slots)
   - Average rating (if reviews exist)
   - Revenue generated

3. **Given** I have experiences with varying performance
   **When** I sort the table by any column
   **Then** the table sorts correctly (ascending/descending toggle)

4. **Given** I am viewing performance metrics
   **When** I select a time period filter (7d, 30d, 90d, 12m)
   **Then** the metrics update to reflect that time period only

5. **Given** I am viewing the performance table
   **When** I look at slot utilization
   **Then** I see a visual indicator (progress bar or percentage badge) showing fill rate

## Tasks / Subtasks

- [x] Create ExperiencePerformanceTable component (AC: 1, 2)
  - [x] Create `src/components/vendor/ExperiencePerformanceTable.tsx`
  - [x] Design table layout with responsive columns
  - [x] Add experience thumbnail and title column
  - [x] Add booking count column with period indicator
  - [x] Add slot utilization column with progress bar
  - [x] Add rating column with star display
  - [x] Add revenue column formatted as currency

- [x] Extend vendorAnalyticsService for performance metrics (AC: 2, 4)
  - [x] Add `ExperiencePerformanceMetrics` interface to vendorAnalyticsService.ts
  - [x] Implement `getExperiencePerformanceMetrics(vendorId, period, sortBy?, sortDir?)` function
  - [x] Query experience_slots table for utilization calculation
  - [x] Query bookings/payments for revenue per experience
  - [x] Add mock data generator for development mode

- [x] Implement sorting functionality (AC: 3)
  - [x] Add sortable column headers with click handlers
  - [x] Implement sort state management (column + direction)
  - [x] Pass sort params to service function
  - [x] Add visual sort indicators (arrows)

- [x] Add time period filter integration (AC: 4)
  - [x] Reuse TimePeriod type from vendorAnalyticsService
  - [x] Add time period selector matching revenue dashboard
  - [x] Update query key to include period
  - [x] Re-fetch when period changes

- [x] Create slot utilization visualization (AC: 5)
  - [x] Create progress bar component or use existing UI primitive
  - [x] Color code: green (>70%), yellow (40-70%), red (<40%)
  - [x] Show percentage text next to bar
  - [x] Handle zero slots gracefully

- [x] Integrate into VendorRevenueDashboard (AC: 1)
  - [x] Add tab or section for "Experience Performance"
  - [x] Or create navigation from dashboard to performance page
  - [x] Maintain consistent header styling

- [x] Add loading and empty states
  - [x] Create skeleton loading for table rows
  - [x] Show empty state when vendor has no experiences
  - [x] Handle experiences with no bookings gracefully

## Dev Notes

### Architecture Patterns

**Data Sources:**
- `experiences` table: Title, thumbnail (via experience_images), price
- `experience_slots` table: Available slots, total capacity for utilization
- `trip_items` + `bookings` + `payments`: Booking count and revenue per experience
- `reviews` table (if exists): Average rating per experience

**Performance Metrics Calculation:**
```sql
-- Booking count per experience
SELECT
  e.id,
  e.title,
  COUNT(DISTINCT b.id) as booking_count,
  SUM(p.amount) as total_revenue
FROM experiences e
LEFT JOIN trip_items ti ON ti.experience_id = e.id
LEFT JOIN trips t ON t.id = ti.trip_id
LEFT JOIN bookings b ON b.trip_id = t.id
LEFT JOIN payments p ON p.booking_id = b.id AND p.status = 'succeeded'
WHERE e.vendor_id = $vendor_id
GROUP BY e.id, e.title;

-- Slot utilization calculation
SELECT
  experience_id,
  SUM(total_capacity) as total_slots,
  SUM(total_capacity - available_count) as booked_slots,
  CASE WHEN SUM(total_capacity) > 0
    THEN ROUND((SUM(total_capacity - available_count)::numeric / SUM(total_capacity)) * 100, 1)
    ELSE 0
  END as utilization_percent
FROM experience_slots
WHERE slot_date >= $start_date AND slot_date <= $end_date
GROUP BY experience_id;
```

**TypeScript Interfaces:**
```typescript
interface ExperiencePerformanceMetrics {
  experienceId: string
  title: string
  thumbnailUrl: string | null
  category: string
  bookingCount: number
  slotUtilization: number // 0-100 percentage
  totalSlots: number
  bookedSlots: number
  averageRating: number | null // null if no reviews
  reviewCount: number
  revenue: number // in cents
}

interface ExperiencePerformanceResponse {
  experiences: ExperiencePerformanceMetrics[]
  totals: {
    totalBookings: number
    averageUtilization: number
    totalRevenue: number
  }
}
```

**Component Structure:**
```
VendorRevenueDashboard.tsx
├── [Existing revenue section]
├── ExperiencePerformanceTable.tsx
│   ├── Time Period Selector (shared)
│   ├── Sortable Table Headers
│   ├── Table Rows
│   │   ├── Experience thumbnail + title
│   │   ├── Booking count badge
│   │   ├── UtilizationBar component
│   │   ├── Rating stars
│   │   └── Revenue amount
│   └── Table Footer (totals)
```

### Code Quality Requirements

**React Patterns (from project-context.md):**
- Use TanStack Query for data fetching with appropriate staleTime
- Use `useQuery` with queryKey including vendorId, period, sortBy, sortDir
- Skeleton loading for table while fetching
- Named exports only (no default export)

**Styling (from project-context.md):**
- Use Tailwind utility classes
- Use existing UI components from @/components/ui/
- Use `cn()` helper for conditional classes
- Mobile-first responsive design

**File Naming:**
- Component: `ExperiencePerformanceTable.tsx` (PascalCase)
- Service functions added to `vendorAnalyticsService.ts`
- Test file: `ExperiencePerformanceTable.test.tsx` (co-located)

### File Structure

**Files to Create:**
- `src/components/vendor/ExperiencePerformanceTable.tsx` - Main table component
- `src/components/vendor/UtilizationBar.tsx` - Reusable progress bar (optional, could use existing)

**Files to Modify:**
- `src/lib/vendorAnalyticsService.ts` - Add performance metrics functions
- `src/components/vendor/VendorRevenueDashboard.tsx` - Integrate table component

### Previous Story Intelligence

From **Story 29-1** (Create Vendor Revenue Dashboard):
- Already created `vendorAnalyticsService.ts` with:
  - `TimePeriod` type ('7d' | '30d' | '90d' | '12m')
  - `formatCurrency()` function (handles cents conversion)
  - `getDateRangeForPeriod()` helper
  - Mock data pattern with `USE_MOCK_DATA` flag
- Created `VendorRevenueDashboard.tsx` with:
  - Time period selector buttons (reuse pattern)
  - TanStack Query usage with 5-min staleTime
  - Experience dropdown filter (can reuse)
  - Recharts integration (if charts needed)
- Created `RevenueSummaryCard.tsx` - loading skeleton pattern to reuse
- Code review fixes applied:
  - ErrorBoundary pattern for chart failures
  - Accessibility attributes (role="tab", aria-selected)
  - Refresh loading state with isFetching

### Git Intelligence

Recent commits:
- `a1a12ed4` - Add Phase 2b epic definitions (Epics 29-32)
- `476d5bf2` - Complete Phase 2a code review fixes

Files from 29-1 implementation:
- src/lib/vendorAnalyticsService.ts (extend this)
- src/components/vendor/VendorRevenueDashboard.tsx (integrate into)
- src/components/vendor/RevenueSummaryCard.tsx (reference pattern)
- src/components/vendor/RevenueChart.tsx (reference pattern)

### Project Structure Notes

**Alignment with Architecture:**
- Part of Epic 29: Vendor Analytics & Payout Dashboard
- Extends work from Story 29-1 (Revenue Dashboard)
- Uses existing vendor authentication from VendorSession
- Follows Supabase service layer pattern

**Integration Points:**
- Reuse `VendorSession` prop from parent components
- Reuse `TimePeriod` type and selector UI
- Extend `vendorAnalyticsService.ts` (don't create new service file)
- Can be a tab within VendorRevenueDashboard or linked page

**Database Tables Used:**
- `experiences` - Core experience data (vendor_id filter)
- `experience_slots` - Slot availability for utilization
- `trip_items` - Links experiences to trips
- `bookings` - Booking records
- `payments` - Revenue data (status='succeeded')
- `experience_images` - Thumbnails (display_order=0 or 1)

### Testing Requirements

**Unit Tests:**
- Test `getExperiencePerformanceMetrics()` with mock data
- Test sorting logic
- Test utilization calculation edge cases (0 slots, 100% full)

**Manual Testing:**
- Verify metrics match actual booking/slot data
- Test sorting on all columns
- Test time period filter updates table
- Test empty state (vendor with no experiences)
- Test experiences with no bookings (show 0s)
- Test mobile responsiveness of table

### References

- [Source: _bmad-output/planning-artifacts/phase-2b-epics.md#Epic-29-Story-29.2]
- [Source: _bmad-output/stories/29-1-create-vendor-revenue-dashboard.md - Previous story patterns]
- [Source: src/lib/vendorAnalyticsService.ts - Extend this service]
- [Source: src/components/vendor/VendorRevenueDashboard.tsx - Integration point]
- [Source: project-context.md - Coding standards]
- [TanStack Table: https://tanstack.com/table/v8] (optional, manual sorting is simpler)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Fixed TypeScript error: bookings table uses `booked_at` not `created_at`

### Completion Notes List

- Created ExperiencePerformanceTable component with sortable columns
- Extended vendorAnalyticsService with performance metrics types and functions
- Implemented UtilizationBar with color-coded progress (green >70%, yellow 40-70%, red <40%)
- Added SortableHeader component with visual sort indicators (arrows)
- Integrated table into VendorRevenueDashboard below the revenue chart
- Browser tested: sorting, utilization bars, ratings, revenue all working correctly
- Mock data generates 6 experiences with realistic metrics

### File List

- `src/components/vendor/ExperiencePerformanceTable.tsx` (created)
- `src/lib/vendorAnalyticsService.ts` (extended with performance metrics)
- `src/components/vendor/VendorRevenueDashboard.tsx` (integrated table)
