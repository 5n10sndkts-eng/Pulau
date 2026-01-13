# Story 3.2: Implement Vendor Login and Portal Access

Status: done

## Story

As a registered vendor,
I want to login to my vendor portal,
so that I can manage my experiences and bookings.

## Acceptance Criteria

1. **Given** my vendor account is verified from Story 3.1 **When** I navigate to /vendor/login and enter correct credentials **Then** my credentials are authenticated against vendors KV namespace
2. A vendor JWT session token is generated (separate from customer tokens)
3. Token includes vendor_id and role: "vendor"
4. **When** authentication succeeds **Then** I am redirected to /vendor/dashboard
5. Vendor navigation shows different menu than customer portal (Dashboard, My Experiences, Bookings, Analytics, Settings)
6. Vendor session expires after 12 hours of inactivity
7. Error displays for unverified vendors: "Your account is pending verification"

## Tasks / Subtasks

- [x] Task 1: Create vendor login UI (AC: #1, #7)
  - [x] Create `src/screens/vendor/VendorLoginScreen.tsx`
  - [x] Build form with business_email and password fields
  - [x] Add "Forgot Password?" link
  - [x] Add "Register as Vendor" link
  - [x] Style with vendor portal branding
  - [x] Show "pending verification" error for unverified accounts
- [x] Task 2: Implement vendor authentication (AC: #1, #2, #3)
  - [x] Create vendor login handler
  - [x] Look up vendor by business_email
  - [x] Verify password hash
  - [x] Check verified status before allowing login
  - [x] Generate vendor JWT with vendor_id and role="vendor"
- [x] Task 3: Create vendor session context (AC: #2, #3, #6)
  - [x] Create VendorAuthContext separate from customer AuthContext
  - [x] Store vendor token in useKV
  - [x] Set 12-hour expiration (different from customer 7-day)
  - [x] Create useVendorAuth hook
- [x] Task 4: Build vendor portal navigation (AC: #4, #5)
  - [x] Create `src/components/vendor/VendorNavigation.tsx`
  - [x] Add sidebar/header with: Dashboard, My Experiences, Bookings, Analytics, Settings
  - [x] Highlight active section
  - [x] Add vendor business name in header
  - [x] Add logout button
- [x] Task 5: Handle successful login (AC: #4)
  - [x] Set vendor authenticated state
  - [x] Navigate to /vendor/dashboard
  - [x] Load vendor profile data
  - [x] Show "Welcome, [Business Name]" toast

## Dev Notes

- Vendor sessions are SEPARATE from customer sessions
- Different expiration: 12 hours vs 7 days for customers
- Vendor portal has completely different navigation structure
- Cannot access vendor portal with customer credentials and vice versa

### References

- [Source: vendor-customer-auth-requirements.md]
- [Source: planning-artifacts/epics/epic-03.md#Story 3.2]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations
