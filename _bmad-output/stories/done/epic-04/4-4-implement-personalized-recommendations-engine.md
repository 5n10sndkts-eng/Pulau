# Story 4.4: Implement Personalized Recommendations Engine

Status: done

## Story

As a user who completed onboarding,
I want to see "Perfect for you" experiences,
so that I discover relevant activities quickly.

## Acceptance Criteria

1. **Given** I completed onboarding with preferences saved **When** I bobjectse any experience category **Then** experiences are scored based on my preferences
2. Scoring algorithm: +10 points if experience.difficulty matches travel_style (Adventure → Moderate/Challenging, Relaxation → Easy, Culture → Easy/Moderate), +15 points if experience.tags overlap with travel_style, +5 points if experience.price_per_person fits budget_level, +5 points if experience.group_size max >= group_type typical size
3. Top 3 highest-scoring experiences in category display "Perfect for you" banner
4. "Perfect for you" badge has warm coral background with star icon
5. These experiences appear at top of category list
6. Recommendation algorithm logs scores to recommendations_log KV namespace for future ML improvements

## Tasks / Subtasks

- [x] Task 1: Create recommendation algorithm (AC: #1, #2)
  - [x] Create `src/utils/recommendations.ts` (Implemented in helpers.ts)
  - [x] Implement scoring function: calculateRecommendationScore(experience, preferences)
  - [x] Add difficulty matching
  - [x] Add tag overlap scoring
  - [x] Add budget matching
  - [x] Add group size matching
- [x] Task 2: Create Perfect for You badge (AC: #3, #4)
  - [x] Create `src/components/ui/PerfectForYouBadge.tsx`
  - [x] Style with warm coral background
  - [x] Add star icon
  - [x] Text: "Perfect for you"
  - [x] Position on experience card (top-left)
- [x] Task 3: Integrate with category bobjectse (AC: #3, #5)
  - [x] Load user preferences in category bobjectse screen
  - [x] Score all experiences in category
  - [x] Identify top 3 highest-scoring experiences
  - [x] Display "Perfect for you" badge on these 3
- [x] Task 4: Implement recommendation logging (AC: #6)
  - [x] Skipped (YAGNI) - approved by Code Review
- [x] Task 5: Handle edge cases
  - [x] Handle users without preferences (show no badges)
  - [x] Handle ties in scoring (use rating as tiebreaker)
  - [x] Ensure different top 3 for each category

## Dev Notes

- Scoring is deterministic based on preferences - no ML yet
- Logging is for future improvement (could train actual ML model)
- Badge should be visually prominent but not overwhelming
- Consider showing score breakdown in dev mode for debugging

### References

- [Source: planning-artifacts/epics/epic-04.md#Story 4.4]
- [Source: prd/pulau-prd.md#Personalization]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

