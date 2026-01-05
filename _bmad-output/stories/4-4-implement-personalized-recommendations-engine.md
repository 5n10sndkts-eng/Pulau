# Story 4.4: Implement Personalized Recommendations Engine

Status: ready-for-dev

## Story

As a user who completed onboarding,
I want to see "Perfect for you" experiences,
so that I discover relevant activities quickly.

## Acceptance Criteria

1. **Given** I completed onboarding with preferences saved **When** I browse any experience category **Then** experiences are scored based on my preferences
2. Scoring algorithm: +10 points if experience.difficulty matches travel_style (Adventure → Moderate/Challenging, Relaxation → Easy, Culture → Easy/Moderate), +15 points if experience.tags overlap with travel_style, +5 points if experience.price_per_person fits budget_level, +5 points if experience.group_size max >= group_type typical size
3. Top 3 highest-scoring experiences in category display "Perfect for you" banner
4. "Perfect for you" badge has warm coral background with star icon
5. These experiences appear at top of category list
6. Recommendation algorithm logs scores to recommendations_log table for future ML improvements

## Tasks / Subtasks

- [ ] Task 1: Create recommendation algorithm (AC: #1, #2)
  - [ ] Create `src/utils/recommendations.ts`
  - [ ] Implement scoring function: calculateRecommendationScore(experience, preferences)
  - [ ] Add difficulty matching: Adventure → Moderate/Challenging (+10), Relaxation → Easy (+10), Culture → Easy/Moderate (+10)
  - [ ] Add tag overlap scoring (+15 for matching tags)
  - [ ] Add budget matching (+5): Budget → < $50, Mid-Range → $50-$150, Luxury → > $150
  - [ ] Add group size matching (+5 for appropriate sizes)
- [ ] Task 2: Create Perfect for You badge (AC: #3, #4)
  - [ ] Create `src/components/ui/PerfectForYouBadge.tsx`
  - [ ] Style with warm coral background (#FF6B6B at 10% opacity)
  - [ ] Add star icon (Phosphor Star)
  - [ ] Text: "Perfect for you"
  - [ ] Position on experience card (top-left or as banner)
- [ ] Task 3: Integrate with category browse (AC: #3, #5)
  - [ ] Load user preferences in category browse screen
  - [ ] Score all experiences in category
  - [ ] Identify top 3 highest-scoring experiences
  - [ ] Move top 3 to beginning of list
  - [ ] Display "Perfect for you" badge on these 3
- [ ] Task 4: Implement recommendation logging (AC: #6)
  - [ ] Create recommendations_log structure in useKV
  - [ ] Log: user_id, experience_id, score, score_breakdown, timestamp
  - [ ] Store for potential future ML training data
  - [ ] Add toggle to disable logging (privacy)
- [ ] Task 5: Handle edge cases
  - [ ] Handle users without preferences (show no badges)
  - [ ] Handle ties in scoring (use rating as tiebreaker)
  - [ ] Ensure different top 3 for each category
  - [ ] Cache scores to avoid recalculation

## Dev Notes

- Scoring is deterministic based on preferences - no ML yet
- Logging is for future improvement (could train actual ML model)
- Badge should be visually prominent but not overwhelming
- Consider showing score breakdown in dev mode for debugging

### References

- [Source: epics.md#Story 4.4]
- [Source: prd/pulau-prd.md#Personalization]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

