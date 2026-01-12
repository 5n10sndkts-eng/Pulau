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
