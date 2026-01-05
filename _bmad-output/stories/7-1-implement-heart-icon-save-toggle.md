# Story 7.1: Implement Heart Icon Save Toggle

Status: ready-for-dev

## Story

As a traveler browsing experiences,
I want to tap a heart icon to save an experience,
So that I can quickly bookmark activities I'm interested in.

## Acceptance Criteria

**AC #1: Heart icon tap saves experience**
**Given** I am viewing an experience card (in browse or detail view)
**When** I tap the heart icon
**Then** the heart animates with a "pop" effect (200ms bounce)
**And** heart fills with warm coral color (#FF6B6B)
**And** experience is saved to saved_experiences table (user_id, experience_id, saved_at)
**And** toast notification displays "Saved to wishlist"

**AC #2: Heart icon tap unsaves experience**
**When** I tap the filled heart again
**Then** heart animates back to outline state
**And** record is removed from saved_experiences table
**And** toast displays "Removed from wishlist"

**AC #3: Saved state persists offline**
**And** saved state persists via Spark useKV for offline access

## Tasks / Subtasks

### Task 1: Build heart icon UI component (AC: #1, #2)
- [ ] Create HeartIcon component with outline and filled states
- [ ] Add tap/click handler with state toggle logic
- [ ] Position heart icon in top-right corner of experience cards
- [ ] Ensure 44x44px minimum touch target for accessibility
- [ ] Add visual hover state for desktop users

### Task 2: Implement save/unsave animation (AC: #1, #2)
- [ ] Add Framer Motion wrapper to HeartIcon component
- [ ] Create "pop" bounce animation (200ms spring) for save action
- [ ] Implement reverse animation for unsave action
- [ ] Test animation performance on mobile devices
- [ ] Add color transition from outline to coral (#FF6B6B)

### Task 3: Integrate with saved_experiences data layer (AC: #1, #2, #3)
- [ ] Create useSavedExperiences hook with useKV persistence
- [ ] Implement saveExperience function to add record (user_id, experience_id, saved_at)
- [ ] Implement unsaveExperience function to remove record
- [ ] Add duplicate check to prevent multiple saves
- [ ] Sync saved state across all experience card instances

### Task 4: Add toast notifications (AC: #1, #2)
- [ ] Integrate toast notification system (shadcn/ui Toast)
- [ ] Display "Saved to wishlist" on successful save
- [ ] Display "Removed from wishlist" on successful unsave
- [ ] Configure toast duration (3 seconds) and position (bottom)
- [ ] Ensure toasts don't stack excessively on rapid taps

### Task 5: Implement offline persistence with Spark useKV (AC: #3)
- [ ] Configure useKV hook for saved_experiences key
- [ ] Implement optimistic UI updates for instant feedback
- [ ] Add sync mechanism for when app comes back online
- [ ] Handle edge cases (network errors, stale data)
- [ ] Test offline save/unsave functionality

## Dev Notes

### Technical Guidance
- Use Spark's `useKV` hook for persistence: `const [savedExperiences, setSavedExperiences] = useKV<SavedExperience[]>('saved_experiences', [])`
- Implement null safety: check if user is logged in before allowing save
- Heart icon should use Lucide React icons: `Heart` (outline) and `HeartIcon` with fill
- Animation spring config: `{ type: "spring", stiffness: 500, damping: 30 }`
- Toast variant: use default (not destructive) with success styling

### Data Structure
```typescript
interface SavedExperience {
  user_id: string;
  experience_id: string;
  saved_at: string; // ISO timestamp
}
```

### Performance Considerations
- Debounce rapid taps to prevent duplicate API calls
- Use optimistic updates for instant UI feedback
- Lazy load saved state on component mount
- Consider using React Context for global saved state management

## References

- [Source: epics.md#Epic 7, Story 7.1]
- [Source: prd/pulau-prd.md#Wishlist & Saved Experiences]
- [Figma: Experience Card Components]
- [Technical: Spark useKV Documentation]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
