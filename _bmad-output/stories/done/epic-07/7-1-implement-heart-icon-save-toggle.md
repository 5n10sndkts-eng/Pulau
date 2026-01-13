# Story 7.1: Implement Heart Icon Save Toggle

Status: done

## Story

As a traveler bobjectsing experiences,
I want to tap a heart icon to save an experience,
So that I can quickly bookmark activities I'm interested in.

## Acceptance Criteria

**AC #1: Heart icon tap saves experience**
**Given** I am viewing an experience card (in bobjectse or detail view)
**When** I tap the heart icon
**Then** the heart animates with a "pop" effect (200ms bounce)
**And** heart fills with warm coral color (#FF6B6B)
**And** experience is saved to saved_experiences KV namespace (user_id, experience_id, saved_at)
**And** toast notification displays "Saved to wishlist"

**AC #2: Heart icon tap unsaves experience**
**When** I tap the filled heart again
**Then** heart animates back to outline state
**And** record is removed from saved_experiences KV namespace
**And** toast displays "Removed from wishlist"

**AC #3: Saved state persists offline**
**And** saved state persists via Spark useKV for offline access

## Tasks / Subtasks

### Task 1: Build heart icon UI component (AC: #1, #2)

- [x] Create HeartIcon component with outline and filled states
- [x] Add tap/click handler with state toggle logic
- [x] Position heart icon in top-right corner of experience cards
- [x] Ensure 44x44px minimum touch target for accessibility
- [x] Add visual hover state for desktop users

### Task 2: Implement save/unsave animation (AC: #1, #2)

- [x] Add Framer Motion wrapper to HeartIcon component
- [x] Create "pop" bounce animation (200ms spring) for save action
- [x] Implement reverse animation for unsave action
- [x] Test animation performance on mobile devices
- [x] Add color transition from outline to coral (#FF6B6B)

### Task 3: Integrate with saved_experiences data layer (AC: #1, #2, #3)

- [x] Create useSavedExperiences hook with useKV persistence
- [x] Implement saveExperience function to add record (user_id, experience_id, saved_at)
- [x] Implement unsaveExperience function to remove record
- [x] Add duplicate check to prevent multiple saves
- [x] Sync saved state across all experience card instances

### Task 4: Add toast notifications (AC: #1, #2)

- [x] Integrate toast notification system (shadcn/ui Toast)
- [x] Display "Saved to wishlist" on successful save
- [x] Display "Removed from wishlist" on successful unsave
- [x] Configure toast duration (3 seconds) and position (bottom)
- [x] Ensure toasts don't stack excessively on rapid taps

### Task 5: Implement offline persistence with Spark useKV (AC: #3)

- [x] Configure useKV hook for saved_experiences key
- [x] Implement optimistic UI updates for instant feedback
- [x] Add sync mechanism for when app comes back online
- [x] Handle edge cases (network errors, stale data)
- [x] Test offline save/unsave functionality

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

- [Source: planning-artifacts/epics/epic-07.md#Epic 7, Story 7.1]
- [Source: prd/pulau-prd.md#Wishlist & Saved Experiences]
- [Figma: Experience Card Components]
- [Technical: Spark useKV Documentation]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations
