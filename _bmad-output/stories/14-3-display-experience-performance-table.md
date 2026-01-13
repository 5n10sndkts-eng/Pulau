### Story 14.3: Display Experience Performance Table

As a vendor with multiple experiences,
I want to see which experiences perform best,
So that I can focus my efforts.

**Acceptance Criteria:**

**Given** I am on vendor analytics
**When** I scroll to "Experience Performance" section
**Then** I see a sortable table with columns:

- Experience Name
- Views (experience page loads)
- Bookings
- Conversion Rate (bookings/views %)
- Revenue
- Avg Rating
  **And** table sortable by clicking column headers
  **And** default sort: Revenue descending
  **And** sparkline mini-chart for each row showing trend
  **When** I click an experience row
  **Then** I navigate to that experience's detailed analytics
