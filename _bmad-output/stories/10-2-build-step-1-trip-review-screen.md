# Story 10.2: Build Step 1 - Trip Review Screen

Status: ready-for-dev

## Story

As a traveler in checkout,
I want to review my complete trip before providing details,
So that I can confirm my selections.

## Acceptance Criteria

**AC #1: Display all trip items with details**
**Given** I am on checkout Step 1 (Review)
**When** the screen loads
**Then** I see all trip items displayed:
  - Experience image thumbnail
  - Experience title
  - Scheduled date and time (or "Unscheduled")
  - Guest count with edit button
  - Item price (price × guests)

**AC #2: Show price summary at bottom**
**And** price summary at bottom: Subtotal, Service Fee (10%), Total

**AC #3: Allow trip editing**
**And** "Edit Trip" link returns to trip builder
**And** "Continue" button advances to Step 2

**AC #4: Allow inline guest count editing**
**When** I tap edit on guest count
**Then** inline stepper allows adjustment
**And** prices update immediately

## Tasks / Subtasks

### Task 1: Create TripReviewStep component (AC: #1, #2, #3)
- [ ] Build TripReviewStep layout component
- [ ] Display header: "Review Your Trip"
- [ ] Render list of all trip items with TripReviewItemCard
- [ ] Add PriceSummary component at bottom
- [ ] Include "Edit Trip" link and "Continue" button in footer

### Task 2: Build TripReviewItemCard component (AC: #1, #4)
- [ ] Create card showing experience thumbnail (80x80px)
- [ ] Display experience title, category, duration
- [ ] Show scheduled date/time or "Unscheduled" badge
- [ ] Add guest count display with inline edit button
- [ ] Display calculated item price (price × guest_count)

### Task 3: Implement inline guest count editor (AC: #4)
- [ ] Add "Edit" button next to guest count
- [ ] Toggle to GuestCountStepper on edit click
- [ ] Update trip item guest_count on change
- [ ] Recalculate item and total prices immediately
- [ ] Save changes to checkout session

### Task 4: Add "Edit Trip" navigation (AC: #3)
- [ ] Create "Edit Trip" link button in header or footer
- [ ] Navigate back to trip builder on click
- [ ] Preserve checkout session (don't clear)
- [ ] Show toast: "Checkout paused. Resume anytime."
- [ ] Ensure trip changes sync to checkout session

### Task 5: Implement "Continue" validation and navigation (AC: #3)
- [ ] Add "Continue to Traveler Details" button
- [ ] Validate: trip has at least 1 item
- [ ] On continue: save trip snapshot to checkout session
- [ ] Advance to Step 2 (Traveler Details)
- [ ] Scroll to top of page on step change

## Dev Notes

### Technical Guidance
- Use checkout session trip snapshot (not live trip data)
- Guest count changes: update session, not main trip
- Price calculations: reuse from Story 8.10 utilities
- Validation: block continue if trip is empty
- Layout: max-width 800px, centered

### Component Structure
```typescript
<TripReviewStep>
  <Header>
    <h1>Review Your Trip</h1>
    <EditTripLink onClick={navigateToTripBuilder} />
  </Header>
  <ItemsList>
    {tripItems.map(item => (
      <TripReviewItemCard
        key={item.id}
        item={item}
        onGuestCountChange={handleGuestCountChange}
      />
    ))}
  </ItemsList>
  <PriceSummary
    subtotal={calculateSubtotal(tripItems)}
    serviceFee={calculateServiceFee(subtotal)}
    total={calculateTotal(subtotal, serviceFee)}
  />
  <Footer>
    <Button variant="outline" onClick={navigateToTripBuilder}>
      Edit Trip
    </Button>
    <Button onClick={handleContinue}>
      Continue to Traveler Details
    </Button>
  </Footer>
</TripReviewStep>
```

### Visual Specifications
- Item card: horizontal layout, 16px padding, border bottom
- Thumbnail: 80x80px, rounded 8px
- Guest count: "2 guests" with small edit icon button
- Unscheduled badge: gray background, "Not scheduled"
- Price: right-aligned, bold, teal color
- Footer buttons: full width on mobile, inline on desktop

## References

- [Source: epics.md#Epic 10, Story 10.2]
- [Source: prd/pulau-prd.md#Checkout Step 1]
- [Related: Story 10.1 - Create Checkout Flow Navigation]
- [Related: Story 8.10 - Real-Time Price Calculation]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
