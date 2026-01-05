# Story 14.1: Build Vendor Analytics Dashboard

Status: ready-for-dev

## Story

As a vendor,
I want to see my business performance metrics,
So that I can understand how my experiences are doing.

## Acceptance Criteria

### AC 1: Analytics Screen Access
**Given** I am logged in as a vendor
**When** I navigate to "Analytics" in vendor portal
**Then** I see the analytics dashboard

### AC 2: Key Metrics Cards Display
**Given** the dashboard has loaded
**When** I view the metrics
**Then** I see dashboard with key metrics cards:
- Total Revenue (this month vs last month, % change)
- Total Bookings (this month vs last month)
- Average Rating (overall, with trend arrow)
- Profile Views (this month)
**And** each card has icon, value, comparison text

### AC 3: Date Range Selector
**Given** metrics are displayed
**When** I view the date range options
**Then** I see date range selector: "This Week", "This Month", "This Year", "Custom"

### AC 4: Metrics Refresh on Date Change
**Given** I select a different date range
**When** the selection changes
**Then** metrics refresh on date range change

## Tasks / Subtasks

### Task 1: Create Vendor Analytics Screen (AC: #1)
- [ ] Create screen in `app/vendor/analytics.tsx`
- [ ] Add to vendor portal navigation
- [ ] Set up layout with cards grid
- [ ] Add role-based access control (vendors only)

### Task 2: Build Metrics Cards (AC: #2)
- [ ] Create MetricCard component
- [ ] Display Total Revenue with comparison
- [ ] Show Total Bookings count
- [ ] Display Average Rating with stars
- [ ] Show Profile Views count
- [ ] Add icons for each metric
- [ ] Calculate % change from previous period

### Task 3: Implement Date Range Selector (AC: #3, #4)
- [ ] Create DateRangeSelector component
- [ ] Add preset options: Week, Month, Year
- [ ] Add custom date range picker
- [ ] Store selected range in state
- [ ] Trigger metrics refetch on change

### Task 4: Fetch Analytics Data (AC: #2, #4)
- [ ] Create useVendorAnalytics hook
- [ ] Query bookings, reviews, views for vendor
- [ ] Calculate revenue totals and comparisons
- [ ] Aggregate bookings by date range
- [ ] Calculate average rating
- [ ] Count profile/experience views

### Task 5: Add Loading and Empty States
- [ ] Show skeleton loaders for metrics
- [ ] Handle empty state (no data yet)
- [ ] Display error messages on fetch failure
- [ ] Add retry mechanism

## Dev Notes

### Analytics Query
```typescript
const useVendorAnalytics = (dateRange) => {
  return useQuery({
    queryKey: ['vendor-analytics', vendor.id, dateRange],
    queryFn: async () => {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, trip_items(experiences(vendor_id))')
        .eq('trip_items.experiences.vendor_id', vendor.id)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      const revenue = bookings.reduce((sum, b) => sum + b.total_amount, 0);
      // ...calculate other metrics

      return { revenue, bookings: bookings.length, avgRating, views };
    },
  });
};
```

### Metric Comparison
```typescript
const calculateChange = (current: number, previous: number) => {
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
};
```

## References

- [Source: epics.md#Epic 14 - Story 14.1]
- [Related: Story 14.2, 14.3, 14.4]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
