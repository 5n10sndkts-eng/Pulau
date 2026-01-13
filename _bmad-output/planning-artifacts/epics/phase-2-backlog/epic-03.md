# Epic 3: Vendor Portal & Authentication

**Goal:** Local operators (vendors) register, login securely, and access their dedicated management portal separate from customer portal.

### Story 3.1: Create Vendor Registration Flow

As a local tour operator, I want to register as a vendor on the platform, so that I can list my experiences for travelers to book.

**Acceptance Criteria:**

- **Given** I am on the vendor registration page **When** I submit the form **Then** a new vendor account is created in "pending_verification" status
- **And** business email is validated for uniqueness
- **And** admin notification is sent for manual approval
- **And** I see a registration received message

### Story 3.2: Implement Vendor Login and Portal Access

As a registered vendor, I want to login to my vendor portal, so that I can manage my experiences and bookings.

**Acceptance Criteria:**

- **Given** my vendor account is verified **When** I login with correct credentials **Then** a vendor JWT session is generated
- **And** I am redirected to the /vendor/dashboard
- **And** navigation shows vendor-specific menu items

### Story 3.3: Build Vendor Dashboard Landing Page

As a logged-in vendor, I want to see an overview dashboard, so that I can quickly understand my business performance.

**Acceptance Criteria:**

- **Given** I am logged in as a vendor **When** I access the dashboard **Then** I see summary cards for experiences, bookings, revenue, and ratings
- **And** I see a "Recent Bookings" list
- **And** Quick Action buttons allow adding experiences or managing calendar
