# Epic 14: Vendor Analytics & Revenue Tracking

**Goal:** Vendors track business performance with analytics dashboard showing booking metrics, revenue tracking, view counts, conversion rates, and customer engagement data.

### Story 14.1: Build Vendor Analytics Dashboard
As a vendor, I want to see my business performance metrics, so that I can understand how my experiences are doing.

**Acceptance Criteria:**
- **Given** vendor analytics **When** dashboard loads **Then** I see metrics for Revenue, Bookings, Avg Rating, and Views
- **And** date range selector updates all metrics instantly

### Story 14.2: Create Revenue Chart Visualization
As a vendor, I want to see revenue trends over time, so that I can identify patterns in my business.

**Acceptance Criteria:**
- **Given** analytics dashboard **When** section loads **Then** I see a line chart with time (X) vs Revenue (Y)
- **And** hover/tap reveals exact values; chart uses primary teal color

### Story 14.3: Display Experience Performance Table
As a vendor with multiple experiences, I want to see which experiences perform best, so that I can focus my efforts.

**Acceptance Criteria:**
- **Given** vendor analytics **When** section loads **Then** I see a sortable table for Views, Bookings, Conv. Rate, Revenue, and Rating
- **And** default sort is Revenue DESC; each row has a trend mini-chart

### Story 14.4: Implement Conversion Funnel View
As a vendor, I want to see where travelers drop off, so that I can improve my listings.

**Acceptance Criteria:**
- **Given** experience-specific analytics **When** funnel section loads **Then** I see a visual funnel from Impressions → Page Views → Added to Trip → Booked
- **And** percentage drop-offs are displayed between each stage
