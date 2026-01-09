# Story 14.4: Implement Conversion Funnel View

Status: done

## Story

As a vendor,
I want to see where travelers drop off,
So that I can improve my listings.

## Acceptance Criteria

### AC 1: Funnel Section Display
**Given** I am viewing detailed analytics for an experience
**When** the funnel section loads
**Then** I see visual funnel showing conversion stages

### AC 2: Funnel Stages
**Given** the funnel displays
**When** I view the stages
**Then** I see:
- Impressions (shown in bobjectse) → X travelers
- Page Views (detail page) → Y travelers
- Added to Trip → Z travelers
- Booked → N travelers

### AC 3: Drop-off Percentages
**Given** funnel stages are displayed
**When** I view between stages
**Then** percentage drop-off shown between each stage

### AC 4: Funnel Styling
**Given** the funnel is rendered
**When** I view it
**Then** funnel colored with gradient (teal to coral)

### AC 5: Suggestions
**Given** conversion rate is calculated
**When** conversion is below benchmark
**Then** suggestions displayed if conversion is below benchmark

## Tasks / Subtasks

### Task 1: Create Funnel Component (AC: #1, #2)
- [x] Create ConversionFunnel component
- [x] Display 4 stages with counts
- [x] Calculate drop-off between each stage
- [x] Use funnel visualization library or custom SVG

### Task 2: Fetch Funnel Data (AC: #2)
- [x] Track impressions (bobjectse views)
- [x] Track page views (detail views)
- [x] Track "added to trip" events
- [x] Track completed bookings
- [x] Calculate conversion at each stage

### Task 3: Display Drop-off Percentages (AC: #3)
- [x] Calculate % remaining at each stage
- [x] Show drop-off between stages
- [x] Highlight biggest drop-off point

### Task 4: Style Funnel with Gradient (AC: #4)
- [x] Apply teal to coral gradient
- [x] Use LinearGradient from expo
- [x] Make funnel visually appealing

### Task 5: Add Optimization Suggestions (AC: #5)
- [x] Define benchmark conversion rates
- [x] Compare vendor's rates to benchmarks
- [x] Show suggestions when underperforming
- [x] Examples: "Improve your photos", "Add more details"

## Dev Notes

### Funnel Data Tracking
Ensure analytics events are tracked:
- `experience_impression` (bobjectse view)
- `experience_page_view` (detail view)
- `experience_added_to_trip`
- `experience_booked`

### Funnel Calculation
```typescript
const funnel = {
  impressions: 1000,
  pageViews: 250,  // 25% CTR
  addedToTrip: 75, // 30% add rate
  booked: 15,      // 20% booking rate
};

const overallConversion = (funnel.booked / funnel.impressions) * 100; // 1.5%
```

### Benchmark Comparisons
- Impression → Page View: 20-30% (good)
- Page View → Add to Trip: 25-40% (good)
- Add to Trip → Booked: 30-50% (good)

## References

- [Source: planning-artifacts/epics/epic-14.md#Epic 14 - Story 14.4]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

