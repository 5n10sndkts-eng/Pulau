## Epic 3: Vendor Portal & Authentication

**Goal:** Local operators (vendors) register, login securely, and access their dedicated management portal separate from customer portal.

### Story 3.1: Create Vendor Registration Flow

As a local tour operator,
I want to register as a vendor on the platform,
So that I can list my experiences for travelers to book.

**Acceptance Criteria:**

**Given** I am on the vendor registration page (separate route from customer)
**When** I submit the vendor registration form
**Then** a new vendor account is created in vendors table
**And** vendors table includes: id (UUID), business_name, business_email, hashed_password, owner_first_name, owner_last_name, phone, created_at, verified (boolean), since_year
**And** business email is validated for uniqueness
**And** password meets security requirements (min 8 chars, hashed with bcrypt)
**And** vendor status is set to "pending_verification"
**And** verification email is sent to business_email
**And** admin notification is sent for manual vendor approval
**And** I see "Registration received - awaiting approval" message

### Story 3.2: Implement Vendor Login and Portal Access

As a registered vendor,
I want to login to my vendor portal,
So that I can manage my experiences and bookings.

**Acceptance Criteria:**

**Given** my vendor account is verified from Story 3.1
**When** I navigate to /vendor/login and enter correct credentials
**Then** my credentials are authenticated against vendors table
**And** a vendor JWT session token is generated (separate from customer tokens)
**And** token includes vendor_id and role: "vendor"
**When** authentication succeeds
**Then** I am redirected to /vendor/dashboard
**And** vendor navigation shows different menu than customer portal (Dashboard, My Experiences, Bookings, Analytics, Settings)
**And** vendor session expires after 12 hours of inactivity
**And** error displays for unverified vendors: "Your account is pending verification"

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
