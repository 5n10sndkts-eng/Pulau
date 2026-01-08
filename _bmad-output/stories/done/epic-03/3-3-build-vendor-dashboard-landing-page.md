# Story 3.3: Build Vendor Dashboard Landing Page

Status: ready-for-dev

## Story

As a logged-in vendor,
I want to see an overview dashboard,
so that I can quickly understand my business performance.

## Acceptance Criteria

1. **Given** I am logged in as a vendor **When** I access /vendor/dashboard **Then** dashboard displays summary cards: Total Experiences Listed (count), Total Bookings This Month (count), Revenue This Month (sum of booking amounts), Average Rating (avg of all reviews)
2. Dashboard shows "Recent Bookings" list (latest 5 with: traveler name, experience name, date, status)
3. Dashboard shows "Quick Actions" buttons: "+ Add New Experience", "View All Bookings", "Manage Calendar"
4. All data queries filter by vendor_id of logged-in vendor
5. Empty state shows when no experiences exist yet: "List your first experience to get started"

## Tasks / Subtasks

- [ ] Task 1: Create dashboard layout (AC: #1)
  - [ ] Create `src/screens/vendor/VendorDashboardScreen.tsx`
  - [ ] Build 4-card summary grid (responsive: 2x2 on mobile, 1x4 on desktop)
  - [ ] Style cards with icons: Briefcase (experiences), Calendar (bookings), DollarSign (revenue), Star (rating)
  - [ ] Show value + comparison text (e.g., "+5% from last month")
- [ ] Task 2: Implement summary card data (AC: #1, #4)
  - [ ] Create dashboard data hooks
  - [ ] Calculate Total Experiences: count of vendor's experiences
  - [ ] Calculate Total Bookings: count of bookings this month
  - [ ] Calculate Revenue: sum of booking amounts this month
  - [ ] Calculate Average Rating: avg of experience reviews
  - [ ] Filter all queries by logged-in vendor_id
- [ ] Task 3: Build recent bookings list (AC: #2)
  - [ ] Create RecentBookingsList component
  - [ ] Display 5 most recent bookings
  - [ ] Show: traveler name, experience name, date, status badge
  - [ ] Status badges: Confirmed (green), Pending (yellow), Cancelled (gray)
  - [ ] Add "View All" link to full bookings list
- [ ] Task 4: Add quick actions section (AC: #3)
  - [ ] Create QuickActions component
  - [ ] Add "+ Add New Experience" button (primary) → navigate to experience creation
  - [ ] Add "View All Bookings" button → navigate to bookings list
  - [ ] Add "Manage Calendar" button → navigate to availability calendar
- [ ] Task 5: Handle empty state (AC: #5)
  - [ ] Detect when vendor has no experiences
  - [ ] Show friendly empty state illustration
  - [ ] Display "List your first experience to get started"
  - [ ] Prominent "Add Experience" CTA button

## Dev Notes

- Use mock data for initial implementation
- Dashboard refreshes data on each visit
- Cards should animate numbers on load (optional)
- Date calculations based on current month

### References

- [Source: planning-artifacts/epics/epic-03.md#Story 3.3]
- [Source: vendor-customer-auth-requirements.md]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

