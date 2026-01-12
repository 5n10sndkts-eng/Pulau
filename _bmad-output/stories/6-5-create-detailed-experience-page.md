### Story 6.5: Create Detailed Experience Page

As a traveler,
I want to view comprehensive information about an experience,
So that I can make an informed booking decision.

**Acceptance Criteria:**

**Given** I tapped "See Details" or an experience card from browse
**When** the experience detail page loads
**Then** I see a full-width image carousel (swipeable, 4-6 images from experience_images ordered by display_order)
**And** carousel has dot indicators at bottom
**And** floating back button (top left, semi-transparent) and heart/save button (top right)
**And** Quick Info Bar displays icons: Duration, Group size, Difficulty, Languages
**And** "About This Experience" section shows full description from experiences table
**And** page loads experience data by experience_id from experiences table
**And** all sections scroll vertically
**And** images lazy load as user scrolls
**And** parallax effect on hero image as user scrolls (subtle)
