### Story 6.4: Add Experience Search Functionality

As a traveler,
I want to search for experiences by keyword,
So that I can quickly find specific activities.

**Acceptance Criteria:**

**Given** I am on any category browse screen
**When** I tap the search icon in header
**Then** a search input field expands below header
**When** I type a search query (e.g., "snorkeling", "temple", "cooking")
**Then** experiences are filtered in real-time as I type (debounced 300ms)
**And** search matches against: experience title, description, subcategory, vendor business_name, tags
**And** results display with search terms highlighted
**When** no results match
**Then** empty state shows: friendly illustration, "No experiences match 'query'", "Try different keywords or [Browse All]"
**When** I clear search or tap back
**Then** full experience list returns
**And** search queries log to search_log table (user_id, query, results_count, searched_at) for analytics
