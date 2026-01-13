# Story 3.3: Build Vendor Dashboard Landing Page

Status: done

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

- [x] Task 1: Create dashboard layout (AC: #1)
  - [x] Create `src/screens/vendor/VendorDashboardScreen.tsx`
  - [x] Build 4-card summary grid (responsive: 2x2 on mobile, 1x4 on desktop)
  - [x] Style cards with icons: Briefcase (experiences), Calendar (bookings), DollarSign (revenue), Star (rating)
  - [x] Show value + comparison text (e.g., "+5% from last month")
- [x] Task 2: Implement summary card data (AC: #1, #4)
  - [x] Create dashboard data hooks
  - [x] Calculate Total Experiences: count of vendor's experiences
  - [x] Calculate Total Bookings: count of bookings this month
  - [x] Calculate Revenue: sum of booking amounts this month
  - [x] Calculate Average Rating: avg of experience reviews
  - [x] Filter all queries by logged-in vendor_id
- [x] Task 3: Build recent bookings list (AC: #2)
  - [x] Create RecentBookingsList component
  - [x] Display 5 most recent bookings
  - [x] Show: traveler name, experience name, date, status badge
  - [x] Status badges: Confirmed (green), Pending (yellow), Cancelled (gray)
  - [x] Add "View All" link to full bookings list
- [x] Task 4: Add quick actions section (AC: #3)
  - [x] Create QuickActions component
  - [x] Add "+ Add New Experience" button (primary) → navigate to experience creation
  - [x] Add "View All Bookings" button → navigate to bookings list
  - [x] Add "Manage Calendar" button → navigate to availability calendar
- [x] Task 5: Handle empty state (AC: #5)
  - [x] Detect when vendor has no experiences
  - [x] Show friendly empty state illustration
  - [x] Display "List your first experience to get started"
  - [x] Prominent "Add Experience" CTA button

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

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations
