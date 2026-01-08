# Story 9.2: Display Conflict Warning Banners

Status: ready-for-dev

## Story

As a traveler,
I want to see visual warnings when activities overlap,
So that I can fix scheduling issues.

## Acceptance Criteria

**AC #1: Show conflict warning banners**
**Given** a scheduling conflict is detected from Story 9.1
**When** I view the trip builder
**Then** conflicting items show yellow warning banner
**And** banner displays: warning icon (⚠️), "Schedule conflict with [other item name]"
**And** banner background uses Golden Sand color (#F4D03F at 20% opacity)
**And** banner appears between the two conflicting item cards

**AC #2: Remove warning when conflict resolved**
**When** conflict is resolved (item moved or removed)
**Then** warning banner disappears with fade animation

## Tasks / Subtasks

### Task 1: Create ConflictWarningBanner component (AC: #1)
- [ ] Build ConflictWarningBanner component with icon and message
- [ ] Style with Golden Sand background (#F4D03F20)
- [ ] Add warning icon (⚠️) from Lucide React icons
- [ ] Display message: "Schedule conflict with [other item name]"
- [ ] Make banner tappable to show resolution options (Story 9.3)

### Task 2: Position banners in trip item list (AC: #1)
- [ ] Insert banner between conflicting item cards
- [ ] Determine banner position based on item order in list
- [ ] Handle multiple conflicts for same item
- [ ] Ensure proper spacing and padding
- [ ] Make banners responsive on mobile and desktop

### Task 3: Fetch and display conflicting item names (AC: #1)
- [ ] Access conflicts from useTripManagement hook
- [ ] Look up experience names for conflicting item IDs
- [ ] Format message dynamically with item names
- [ ] Handle edge case: conflicting item not found
- [ ] Truncate long names if needed (max 40 characters)

### Task 4: Implement fade-out animation on resolution (AC: #2)
- [ ] Detect when conflict is removed from conflicts array
- [ ] Trigger fade-out animation (200ms)
- [ ] Remove banner from DOM after animation completes
- [ ] Use Framer Motion's AnimatePresence for smooth exit
- [ ] Ensure no layout shift during banner removal

### Task 5: Add tap interaction to open resolution sheet (AC: #1)
- [ ] Make banner interactive with hover/active states
- [ ] On tap: open conflict resolution bottom sheet (Story 9.3)
- [ ] Pass conflict data to resolution component
- [ ] Add visual feedback on tap (ripple effect)
- [ ] Ensure 44px minimum touch target

## Dev Notes

### Technical Guidance
- Banner component: use alert/banner pattern from shadcn/ui
- Conflicts: access via `const { conflicts } = useTripManagement()`
- Positioning: render banners inline in item list, not as overlay
- Animation: Framer Motion's `exit` animation for smooth removal
- Color: Golden Sand #F4D03F with 20% opacity = #F4D03F33

### Component Structure
```typescript
<DaySection date={date}>
  {dayItems.map(item => {
    const conflict = conflicts.find(c => c.item_ids.includes(item.id));

    return (
      <Fragment key={item.id}>
        <TripItemCard item={item} />
        {conflict && (
          <ConflictWarningBanner
            conflict={conflict}
            currentItemId={item.id}
            onTap={() => openResolutionSheet(conflict)}
          />
        )}
      </Fragment>
    );
  })}
</DaySection>
```

### ConflictWarningBanner Component
```typescript
interface ConflictWarningBannerProps {
  conflict: Conflict;
  currentItemId: string;
  onTap: () => void;
}

const ConflictWarningBanner: FC<ConflictWarningBannerProps> = ({
  conflict,
  currentItemId,
  onTap
}) => {
  const otherItemId = conflict.item_ids.find(id => id !== currentItemId);
  const otherItem = getTripItemById(otherItemId);
  const otherExperience = getExperienceById(otherItem?.experience_id);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="conflict-warning-banner"
      onClick={onTap}
    >
      <AlertTriangle className="icon" />
      <span>Schedule conflict with {otherExperience?.title}</span>
      <ChevronRight className="chevron" />
    </motion.div>
  );
};
```

### Visual Specifications
- Background: #F4D03F33 (Golden Sand 20% opacity)
- Border: 1px solid #F4D03F (Golden Sand)
- Border radius: 8px
- Padding: 12px 16px
- Icon size: 20px, color: #F39C12 (darker yellow)
- Text: 14px, medium weight, gray-800
- Hover: slight darken, cursor pointer

## References

- [Source: planning-artifacts/epics/epic-09.md#Epic 9, Story 9.2]
- [Source: prd/pulau-prd.md#Conflict Detection & Resolution]
- [Related: Story 9.1 - Implement Time Conflict Detection Algorithm]
- [Related: Story 9.3 - Provide Smart Conflict Resolution Suggestions]
- [Figma: Conflict Warning Banner Design]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
