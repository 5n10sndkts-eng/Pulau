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
