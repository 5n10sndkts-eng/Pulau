# Story 33.2: Sticky Trip Bar Integration & "Add to Trip" Buttons

Status: ready-for-dev  
Parent: Epic 33 - Trip Planning & Cart  
Depends On: Story 33.1

## Story

As a **Traveler**,
I want to **add experiences to my trip directly from the browse/explore screens**,
So that **I can build my itinerary without navigating to detail pages and see the sticky trip bar update in real-time.**

## Context

Story 33.1 implemented the `StickyTripBar` component and it's already integrated into `App.tsx`. However, the "Add to Trip" functionality is only available via `handleQuickAdd` which is passed to certain screens but not consistently implemented across all browse views.

This story focuses on:

1. Adding "Add to Trip" buttons to all relevant screens
2. Ensuring the Sticky Trip Bar appears when items are added
3. Verifying the integration works end-to-end

## Acceptance Criteria

### AC 1: Add to Trip on Explore Screen

**Given** the user is on `/explore`  
**When** they see an experience card  
**Then** they should see an "Add to Trip" button on each card  
**And** clicking it should add the experience to their trip  
**And** the Sticky Trip Bar should appear/update at the bottom

### AC 2: Add to Trip on Category Browse

**Given** the user navigates to `/category/:id`  
**When** they view experiences in that category  
**Then** each experience should have an "Add to Trip" button  
**And** the button should trigger the trip bar to appear

### AC 3: Add to Trip on Search Results

**Given** the user searches for experiences  
**When** results are displayed  
**Then** each result should include an "Add to Trip" button  
**And** adding items should reflect in the sticky bar count

### AC 4: Trip Bar Click Behavior

**Given** the Sticky Trip Bar is visible  
**When** the user clicks the main area (not the Checkout button)  
**Then** they should navigate to `/plan` to see the full trip builder

### AC 5: Checkout Button Navigation

**Given** the Sticky Trip Bar is visible  
**When** the user clicks the "Checkout" button  
**Then** they should navigate to `/checkout`  
**And** the checkout flow should begin

## Tasks / Subtasks

### Task 1: Update ExploreScreen Component

- [ ] Add "Add to Trip" button to experience cards in `ExploreScreen.tsx`
- [ ] Ensure `onQuickAdd` prop is properly wired from App.tsx
- [ ] Verify toast notifications appear on add

### Task 2: Update CategoryBrowser Component

- [ ] Add "Add to Trip" button to experience cards in `CategoryBrowser.tsx`
- [ ] Pass `onQuickAdd` through the component hierarchy
- [ ] Test on mobile and desktop viewports

### Task 3: Update HomeScreen Recommendations

- [ ] Ensure "Quick Add" buttons work on recommended experiences
- [ ] Verify trip bar appears when first item is added from home

### Task 4: Implement Trip Bar Click Handlers

- [ ] In `StickyTripBar.tsx`, add onClick handler to main area
- [ ] Navigate to `/plan` when the summary area is clicked
- [ ] Keep Checkout button separate (direct to `/checkout`)

### Task 5: E2E Test Coverage

- [ ] Update `sticky-trip-bar.spec.ts` to match actual implementation
- [ ] Test "Add to Trip" flows on different screens
- [ ] Verify trip bar visibility, count, and total price updates
- [ ] Test navigation from trip bar to /plan and /checkout

## Technical Notes

### Current Integration Status

The `StickyTripBar` is already:

- ✅ Implemented in `src/components/StickyTripBar.tsx`
- ✅ Added to `App.tsx` (line 459)
- ✅ Connected to `TripContext`
- ✅ Includes accessibility fixes and safe area support

### What's Missing

1. **Consistent "Add to Trip" Buttons**: Not all browse screens have visible CTAs
2. **Click Navigation**: Trip bar drawer doesn't navigate to `/plan` yet
3. **Test Data**: E2E tests expect `/experiences` route which doesn't exist

### Component Changes Required

**StickyTripBar.tsx** - Add navigation:

```tsx
import { useNavigate } from 'react-router-dom';

export function StickyTripBar() {
  const navigate = useNavigate();
  const { trip } = useTrip();

  const handleExpand = () => {
    navigate('/plan'); // Navigate to trip builder
  };

  const handleCheckout = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering handleExpand
    navigate('/checkout');
  };

  // ... rest of implementation
}
```

**ExploreScreen.tsx** - Example structure:

```tsx
<ExperienceCard
  experience={exp}
  onQuickAdd={() => onQuickAdd(exp)}
  showAddButton={true}
/>
```

## Verification

### Manual Testing

1. Navigate to `/explore`
2. Click "Add to Trip" on multiple experiences
3. Verify trip bar appears with correct count and total
4. Click trip bar main area → should go to `/plan`
5. Click "Checkout" button → should go to `/checkout`

### E2E Testing

Run: `npm run test:e2e -- sticky-trip-bar.spec.ts`

Expected: All tests pass (currently 30 failures due to missing "Add to Trip" buttons)

## Definition of Done

- [ ] All browse/explore screens have "Add to Trip" buttons
- [ ] Sticky Trip Bar appears when first item is added
- [ ] Trip bar updates in real-time (count + price)
- [ ] Clicking trip bar navigates to `/plan`
- [ ] Checkout button navigates to `/checkout`
- [ ] E2E tests pass on all browsers
- [ ] Code reviewed and approved
- [ ] Merged to main branch

## Dependencies

- **Blocked by**: None (33.1 is complete)
- **Blocks**: Story 33.3 (Trip Canvas Drawer - if we want inline expansion instead of navigation)

## Estimate

**Story Points**: 5  
**Developer Hours**: 6-8 hours

## Labels

`epic:trip-planning` `component:sticky-bar` `integration` `p0` `ready-for-dev`
