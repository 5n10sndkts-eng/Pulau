# Story 9.2: Display Conflict Warning Banners

Status: done

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
- [x] Build ConflictWarningBanner component with icon and message
- [x] Style with Golden Sand background (#F4D03F20)
- [x] Add warning icon (⚠️) from Lucide React icons
- [x] Display message: "Schedule conflict with [other item name]"
- [x] Make banner tappable to show resolution options (Story 9.3)

### Task 2: Position banners in trip item list (AC: #1)
- [x] Insert banner between conflicting item cards
- [x] Determine banner position based on item order in list
- [x] Handle multiple conflicts for same item
- [x] Ensure proper spacing and padding
- [x] Make banners responsive on mobile and desktop

### Task 3: Fetch and display conflicting item names (AC: #1)
- [x] Access conflicts from useTripManagement hook
- [x] Look up experience names for conflicting item IDs
- [x] Format message dynamically with item names
- [x] Handle edge case: conflicting item not found
- [x] Truncate long names if needed (max 40 characters)

### Task 4: Implement fade-out animation on resolution (AC: #2)
- [x] Detect when conflict is removed from conflicts array
- [x] Trigger fade-out animation (200ms)
- [x] Remove banner from DOM after animation completes
- [x] Use Framer Motion's AnimatePresence for smooth exit
- [x] Ensure no layout shift during banner removal

### Task 5: Add tap interaction to open resolution sheet (AC: #1)
- [x] Make banner interactive with hover/active states
- [x] On tap: open conflict resolution bottom sheet (Story 9.3)
- [x] Pass conflict data to resolution component
- [x] Add visual feedback on tap (ripple effect)
- [x] Ensure 44px minimum touch target

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

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

