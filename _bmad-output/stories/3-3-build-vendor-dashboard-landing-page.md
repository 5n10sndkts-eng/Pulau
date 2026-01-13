### Story 3.3: Build Vendor Dashboard Landing Page

As a logged-in vendor,
I want to see an overview dashboard,
So that I can quickly understand my business performance.

**Acceptance Criteria:**

**Given** I am logged in as a vendor
**When** I access /vendor/dashboard
**Then** dashboard displays summary cards:

- Total Experiences Listed (count)
- Total Bookings This Month (count)
- Revenue This Month (sum of booking amounts)
- Average Rating (avg of all reviews)
  **And** dashboard shows "Recent Bookings" list (latest 5 with: traveler name, experience name, date, status)
  **And** dashboard shows "Quick Actions" buttons: "+ Add New Experience", "View All Bookings", "Manage Calendar"
  **And** all data queries filter by vendor_id of logged-in vendor
  **And** empty state shows when no experiences exist yet: "List your first experience to get started"

---
