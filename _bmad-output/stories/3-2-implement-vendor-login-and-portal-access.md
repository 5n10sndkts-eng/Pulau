# Story 3.2: Implement Vendor Login and Portal Access

Status: ready-for-dev

## Story

As a registered vendor,
I want to login to my vendor portal,
so that I can manage my experiences and bookings.

## Acceptance Criteria

1. **Given** my vendor account is verified from Story 3.1 **When** I navigate to /vendor/login and enter correct credentials **Then** my credentials are authenticated against vendors table
2. A vendor JWT session token is generated (separate from customer tokens)
3. Token includes vendor_id and role: "vendor"
4. **When** authentication succeeds **Then** I am redirected to /vendor/dashboard
5. Vendor navigation shows different menu than customer portal (Dashboard, My Experiences, Bookings, Analytics, Settings)
6. Vendor session expires after 12 hours of inactivity
7. Error displays for unverified vendors: "Your account is pending verification"

## Tasks / Subtasks

- [ ] Task 1: Create vendor login UI (AC: #1, #7)
  - [ ] Create `src/screens/vendor/VendorLoginScreen.tsx`
  - [ ] Build form with business_email and password fields
  - [ ] Add "Forgot Password?" link
  - [ ] Add "Register as Vendor" link
  - [ ] Style with vendor portal branding
  - [ ] Show "pending verification" error for unverified accounts
- [ ] Task 2: Implement vendor authentication (AC: #1, #2, #3)
  - [ ] Create vendor login handler
  - [ ] Look up vendor by business_email
  - [ ] Verify password hash
  - [ ] Check verified status before allowing login
  - [ ] Generate vendor JWT with vendor_id and role="vendor"
- [ ] Task 3: Create vendor session context (AC: #2, #3, #6)
  - [ ] Create VendorAuthContext separate from customer AuthContext
  - [ ] Store vendor token in useKV
  - [ ] Set 12-hour expiration (different from customer 7-day)
  - [ ] Create useVendorAuth hook
- [ ] Task 4: Build vendor portal navigation (AC: #4, #5)
  - [ ] Create `src/components/vendor/VendorNavigation.tsx`
  - [ ] Add sidebar/header with: Dashboard, My Experiences, Bookings, Analytics, Settings
  - [ ] Highlight active section
  - [ ] Add vendor business name in header
  - [ ] Add logout button
- [ ] Task 5: Handle successful login (AC: #4)
  - [ ] Set vendor authenticated state
  - [ ] Navigate to /vendor/dashboard
  - [ ] Load vendor profile data
  - [ ] Show "Welcome, [Business Name]" toast

## Dev Notes

- Vendor sessions are SEPARATE from customer sessions
- Different expiration: 12 hours vs 7 days for customers
- Vendor portal has completely different navigation structure
- Cannot access vendor portal with customer credentials and vice versa

### References

- [Source: vendor-customer-auth-requirements.md]
- [Source: epics.md#Story 3.2]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

