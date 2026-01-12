### Story 4.4: Implement Personalized Recommendations Engine

As a user who completed onboarding,
I want to see "Perfect for you" experiences,
So that I discover relevant activities quickly.

**Acceptance Criteria:**

**Given** I completed onboarding with preferences saved
**When** I browse any experience category
**Then** experiences are scored based on my preferences:
  - +10 points if experience.difficulty matches my travel_style (Adventure → Moderate/Challenging, Relaxation → Easy, Culture → Easy/Moderate)
  - +15 points if experience.tags overlap with travel_style
  - +5 points if experience.price_per_person fits my budget_level
  - +5 points if experience.group_size max >= my group_type typical size
**And** top 3 highest-scoring experiences in category display "Perfect for you" banner
**And** "Perfect for you" badge has warm coral background with star icon
**And** these experiences appear at top of category list
**And** recommendation algorithm logs scores to recommendations_log table for future ML improvements

---
