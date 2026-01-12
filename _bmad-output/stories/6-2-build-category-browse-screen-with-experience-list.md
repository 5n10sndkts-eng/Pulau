### Story 6.2: Build Category Browse Screen with Experience List

As a traveler,
I want to browse all experiences in a category,
So that I can see what's available.

**Acceptance Criteria:**

**Given** I tapped a category from Story 6.1
**When** the category browse screen loads
**Then** header shows: back arrow, category title (e.g., "Water Adventures"), search icon
**And** experiences load from experiences table filtered by category and status = "active"
**And** each experience card displays:
  - Hero image (16:9 ratio, rounded corners 12px)
  - Provider badge overlay (vendor business_name)
  - Experience title below image
  - Quick stats: Duration icon + hours, Group size icon + max people, Star icon + rating (avg)
  - Price: "From $XX / person" (formatted with currency)
  - Two buttons: "+ Quick Add" (primary teal), "See Details" (text link)
**And** cards are in vertical scrolling list
**And** list shows skeleton loading state while fetching
**And** infinite scroll loads more experiences as I scroll down (20 per page)
