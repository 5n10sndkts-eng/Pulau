# Story 33.5: Budget Helper & Discovery Optimization

Status: ready-for-dev

## Story

As a **Budget-Conscious Traveler**,
I want to **see how my trip costs align with my budget and have easy ways to find affordable options**,
So that **I can build a complete trip without anxiety about overspending.**

## Acceptance Criteria

### AC 1: Budget Tracking Visualization
**Given** I have set a Budget preference (e.g., "Mid-Range")
**And** that preference maps to a numeric value (e.g., $800)
**When** I have items in my trip
**Then** the Sticky Trip Bar (or a specific Budget Widget) should show "$X Remaining"
**And** it should change color (Green -> Yellow -> Red) as I approach the limit

### AC 2: "Under Budget" Smart Filter
**Given** I have $X remaining in my calculated budget
**When** I browse the feed or category list
**Then** a "Fits your budget" chip/filter should be available
**And** selecting it should only show experiences with `price <= remaining_budget`

### AC 3: "Explore All" Escape Hatch
**Given** I am viewing the "Recommended for You" feed
**Then** a prominent "Explore All Categories" button should be visible (sticky header or top of list)
**And** tapping it should navigate to the `CategoryBrowser` or `ExploreScreen`
**And** this ensures I am not trapped in the personalization bubble

### AC 4: Search Accessibility
**Given** I am on the Home screen
**Then** a Search Bar (or icon) should be immediately accessible
**And** it should allow keyword searching (title, location) across the mock data

## Tasks / Subtasks

### Task 1: Implement Budget Logic (AC: #1)
- [ ] Define budget numeric caps constant: `BUDGET_CAPS = { saver: 300, midrange: 1000, luxury: 5000 }`
- [ ] Calculate `remaining = cap - currentTotal` in `TripContext` or `BudgetHook`
- [ ] Display this metric in the trip UI

### Task 2: Create Budget Filter (AC: #2)
- [ ] Add filter logic to `useExperiences` or feed generation
- [ ] Create UI Chip "Under $X"
- [ ] Implement filtering: `experiences.filter(e => e.price <= remaining)`

### Task 3: Enhance Navigation/Discovery (AC: #3, #4)
- [ ] Add "Explore All" section header to Home feed
- [ ] Ensure Search input is visible
- [ ] Link "Explore All" to `/explore` route

### Task 4: Testing (All ACs)
- [ ] Verify math is correct for "Remaining"
- [ ] Verify filter excludes expensive items
- [ ] Verify "Explore All" works navigationally

## Dev Notes

### Budget Colors
- > 50% remaining: Green (Succcess)
- < 20% remaining: Yellow (Warning)
- < 0 remaining: Red (Destructive)
```