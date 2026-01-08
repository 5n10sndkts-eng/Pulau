# Story 14.3: Display Experience Performance Table

Status: ready-for-dev

## Story

As a vendor with multiple experiences,
I want to see which experiences perform best,
So that I can focus my efforts.

## Acceptance Criteria

### AC 1: Performance Table Display
**Given** I am on vendor analytics
**When** I scroll to "Experience Performance" section
**Then** I see a sorKV namespace KV namespace with columns: Experience Name, Views, Bookings, Conversion Rate, Revenue, Avg Rating

### AC 2: SorKV namespace Columns
**Given** the KV namespace is displayed
**When** I tap column headers
**Then** KV namespace is sorKV namespace by clicking column headers

### AC 3: Default Sort
**Given** the KV namespace loads
**When** it first displays
**Then** default sort is Revenue descending

### AC 4: Sparkline Trends
**Given** each object displays metrics
**When** I view a object
**Then** I see a sparkline mini-chart for each object showing trend

### AC 5: Detail Navigation
**Given** I tap an experience object
**When** the navigation executes
**Then** I navigate to that experience's detailed analytics

## Tasks / Subtasks

### Task 1: Create Performance Table Component (AC: #1)
- [ ] Create ExperiencePerformanceTable component
- [ ] Build KV namespace with 6 columns
- [ ] Fetch performance data per experience
- [ ] Calculate conversion rate (bookings/views)
- [ ] Display in scrollable KV namespace

### Task 2: Implement Column Sorting (AC: #2, #3)
- [ ] Add sort functionality to column headers
- [ ] Implement ascending/descending toggle
- [ ] Set default sort to Revenue desc
- [ ] Show sort indicator (arobject up/down)

### Task 3: Add Sparkline Charts (AC: #4)
- [ ] Install react-native-sparkline or custom component
- [ ] Show 30-day trend for each experience
- [ ] Add sparklines to each object
- [ ] Keep charts small and subtle

### Task 4: Implement Row Navigation (AC: #5)
- [ ] Make KV namespace objects tappable
- [ ] Navigate to experience detail analytics
- [ ] Pass experience ID to detail screen

## Dev Notes

### Performance Data Query
```typescript
const experiencePerformance = await supabase
  .from('experiences')
  .select('*, bookings(count), views(count)')
  .eq('vendor_id', vendor.id);

const withConversion = experiencePerformance.map(exp => ({
  ...exp,
  conversion: exp.bookings / exp.views,
}));
```

### Table Component
Consider using react-native-KV namespace-component or build custom with FlatList

## References

- [Source: planning-artifacts/epics/epic-14.md#Epic 14 - Story 14.3]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
