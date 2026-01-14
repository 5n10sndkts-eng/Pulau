# Defect DEF-003: Trip Timeline Missing Connecting Lines

Status: done
Priority: P2 - Medium
Completed: 2026-01-13
Identified: 2026-01-13
Sprint: UX Refinement (Epic 33)

## Defect Description

Per PRD specification, the TripBuilder should display a "custom trip timeline component with connecting lines between day cards". Current implementation shows a plain Card list without visual timeline connectors.

## Root Cause

The visual timeline design was not implemented during Epic 8 TripBuilder development.

## Impact

- UX diverges from PRD design direction
- Less visual clarity for multi-day itineraries
- Reduced "premium travel magazine" aesthetic per PRD

## Acceptance Criteria

### AC 1: Timeline Connector Lines

**Given** the TripBuilder displays multiple day cards
**When** items are assigned to different dates
**Then** vertical connecting lines appear between consecutive day cards
**And** lines use the primary teal color with subtle opacity

### AC 2: Day Node Indicators

**Given** a day card in the timeline
**When** it is rendered
**Then** a circular node indicator appears on the timeline
**And** the node is filled for days with items, outlined for empty days

### AC 3: Responsive Behavior

**Given** the timeline is viewed on mobile (<640px)
**When** the layout adjusts
**Then** the timeline shifts to a simplified single-column layout
**And** connecting lines remain visible but thinner

---

## Tasks

### Task 1: Create TripTimeline Component (AC: #1, #2)

- [ ] Create `TripTimeline.tsx` in `src/components/trip/`
- [ ] Implement vertical line using CSS border or SVG
- [ ] Add circular node indicators for each day
- [ ] Style with Tailwind using `border-primary/30` for subtle line

### Task 2: Integrate into TripBuilder (AC: #1)

- [ ] Import TripTimeline into TripBuilder screen
- [ ] Wrap day cards with timeline component
- [ ] Pass day data for node state calculation

### Task 3: Responsive Styling (AC: #3)

- [ ] Add mobile-first breakpoint styles
- [ ] Reduce line width on mobile (1px vs 2px)
- [ ] Adjust node size for touch targets

### Task 4: Animation

- [ ] Add subtle fade-in animation for timeline elements
- [ ] Animate new day additions with slide-down

---

## Dev Notes

### Design Reference (from PRD)
```
Customizations:
- Custom trip timeline component with connecting lines between day cards
```

### Implementation Pattern
```tsx
<div className="relative">
  {/* Vertical timeline line */}
  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary/30" />
  
  {days.map((day, index) => (
    <div key={day.date} className="relative pl-10">
      {/* Timeline node */}
      <div className={cn(
        "absolute left-2.5 w-3 h-3 rounded-full border-2 border-primary",
        day.items.length > 0 ? "bg-primary" : "bg-background"
      )} />
      
      {/* Day card content */}
      <DayCard day={day} />
    </div>
  ))}
</div>
```

## Related

- PRD: Component Selection > Customizations
- Epic 8: Trip Canvas & Itinerary Building
- [TripBuilder.tsx](../../src/screens/TripBuilder.tsx)
