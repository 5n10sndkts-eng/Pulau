### Story 14.1: Build Vendor Analytics Dashboard

As a vendor,
I want to see my business performance metrics,
So that I can understand how my experiences are doing.

**Acceptance Criteria:**

**Given** I am logged in as a vendor
**When** I navigate to "Analytics" in vendor portal
**Then** I see dashboard with key metrics cards:
  - Total Revenue (this month vs last month, % change)
  - Total Bookings (this month vs last month)
  - Average Rating (overall, with trend arrow)
  - Profile Views (this month)
**And** each card has icon, value, comparison text
**And** date range selector: "This Week", "This Month", "This Year", "Custom"
**And** metrics refresh on date range change
