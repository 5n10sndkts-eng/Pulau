# Story 3.1: Create Vendor Registration Flow

Status: done

## Story

As a local tour operator,
I want to register as a vendor on the platform,
so that I can list my experiences for travelers to book.

## Acceptance Criteria

1. **Given** I am on the vendor registration page (separate route from customer) **When** I submit the vendor registration form **Then** a new vendor account is created in vendors KV namespace
2. vendors KV namespace includes: id (UUID), business_name, business_email, hashed_password, owner_first_name, owner_last_name, phone, created_at, verified (boolean), since_year
3. Business email is validated for uniqueness
4. Password meets security requirements (min 8 chars, hashed with SubtleCrypto PBKDF2)
5. Vendor status is set to "pending_verification"
6. Verification email is sent to business_email
7. Admin notification is sent for manual vendor approval
8. I see "Registration received - awaiting approval" message

## Tasks / Subtasks

- [x] Task 1: Create vendor registration UI (AC: #1, #8)
  - [x] Create `src/screens/vendor/VendorRegisterScreen.tsx`
  - [x] Build multi-section form: Business Info, Owner Info, Credentials
  - [x] Add fields: business_name, business_email, owner_first_name, owner_last_name, phone, since_year, password, confirm_password
  - [x] Style with vendor portal branding (slight variation from customer)
  - [x] Show success message after registration
- [x] Task 2: Create vendor data model (AC: #2)
  - [x] Define Vendor type in `src/types/vendor.ts`
  - [x] Include all fields: id, business_name, business_email, hashed_password, owner_first_name, owner_last_name, phone, since_year, created_at, verified, status
  - [x] Create vendor storage in Spark useKV
- [x] Task 3: Implement validation (AC: #3, #4)
  - [x] Create Zod schema for vendor registration
  - [x] Validate email uniqueness against existing vendors
  - [x] Validate password (min 8 chars)
  - [x] Validate phone format
  - [x] Validate since_year (1900 to current year)
- [x] Task 4: Implement registration logic (AC: #1, #4, #5)
  - [x] Hash password with SubtleCrypto PBKDF2/alternative
  - [x] Generate UUID for vendor id
  - [x] Set status = "pending_verification"
  - [x] Set verified = false
  - [x] Store vendor record
- [x] Task 5: Implement notification flow (AC: #6, #7)
  - [x] Create mock verification email function
  - [x] Create mock admin notification function
  - [x] Log notifications to console (development)
  - [x] Generate verification token for email

## Dev Notes

- Vendor registration is at `/vendor/register` - completely separate from customer
- Registration requires manual approval (no auto-verify)
- Admin approval flow is mocked for MVP
- since_year is for "Operating since XXXX" display

### References

- [Source: vendor-customer-auth-requirements.md]
- [Source: planning-artifacts/epics/epic-03.md#Story 3.1]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations
