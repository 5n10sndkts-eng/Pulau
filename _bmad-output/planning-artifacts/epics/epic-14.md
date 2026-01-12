## Epic 14: Vendor Analytics & Revenue Tracking

**Goal:** Vendors track business performance with analytics dashboard showing booking metrics, revenue tracking, view counts, conversion rates, and customer engagement data.

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

### Story 14.2: Create Revenue Chart Visualization

As a vendor,
I want to see revenue trends over time,
So that I can identify patterns in my business.

**Acceptance Criteria:**

**Given** I am on the vendor analytics dashboard
**When** the revenue section loads
**Then** I see a line chart showing:
  - X-axis: time periods (days/weeks/months based on range)
  - Y-axis: revenue in vendor's currency
  - Line with data points
  - Hover/tap shows exact value for each point
**And** chart uses primary teal color
**And** "Total for Period" displayed above chart
**And** chart renders smoothly with animation on load

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

### Story 14.4: Implement Conversion Funnel View

As a vendor,
I want to see where travelers drop off,
So that I can improve my listings.

**Acceptance Criteria:**

**Given** I am viewing detailed analytics for an experience
**When** the funnel section loads
**Then** I see visual funnel showing:
  - Impressions (shown in browse) → X travelers
  - Page Views (detail page) → Y travelers
  - Added to Trip → Z travelers
  - Booked → N travelers
**And** percentage drop-off shown between each stage
**And** funnel colored with gradient (teal to coral)
**And** suggestions displayed if conversion is below benchmark

---
