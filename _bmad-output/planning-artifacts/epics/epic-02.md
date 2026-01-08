# Epic 2: User Authentication & Profile Management

**Goal:** Customers create accounts, login securely, manage profiles with saved payment methods, and access personalized features with cross-device synchronization.

**Phase:** Phase 2 (After core user journey)
**Dependencies:** Epic 1 (Foundation)
**Storage:** Per ADR-001, MVP uses KV store with mock auth service

---

### Story 2.1: Implement Customer Registration Flow
As a traveler, I want to create an account with email and password, so that I can save my trips and preferences.

**Acceptance Criteria:**

*Happy Path:*
- **Given** I am on the registration screen **When** I enter valid email and password **Then** a new user account is created in the `pulau_users_{id}` KV namespace
- **And** password is hashed using bcrypt and stored in the user record
- **And** ~~user receives a verification email~~ [MVP: Skip email verification]
- **And** I am redirected to the onboarding flow

*Validation:*
- **Given** I enter an invalid email format **Then** inline error displays "Please enter a valid email"
- **Given** I enter a password < 8 characters **Then** inline error displays "Password must be at least 8 characters"
- **Given** I leave email or password empty **Then** inline error displays "This field is required"
- **And** Submit button is disabled until all validation passes

*Error Cases:*
- **Given** I enter an email that already exists in KV store **Then** error toast displays "An account with this email already exists"
- **Given** KV store write fails (storage full, network error) **Then** error toast displays "Unable to create account. Please try again."
- **And** form data is preserved so user can retry without re-entering

### Story 2.2: Implement Customer Login with Session Management
As a registered traveler, I want to login with my email and password, so that I can access my saved trips and profile.

**Acceptance Criteria:**
- **Given** I have a registered account **When** I enter correct credentials **Then** a secure JWT session token is generated
- **And** session token is stored in localStorage and HTTP-only cookie
- **And** I am redirected to the home screen
- **And** error message displays for incorrect credentials

### Story 2.3: Implement Password Reset Flow
As a traveler who forgot my password, I want to reset my password via email, so that I can regain access to my account.

**Acceptance Criteria:**
- **Given** I am on the "Forgot Password" screen **When** I enter my email **Then** a reset token is generated and emailed to me
- **When** I click the reset link and enter a new password **Then** the token is validated and my password is updated
- **And** all existing sessions are invalidated

### Story 2.4: Create User Profile Management Interface
As a logged-in traveler, I want to view and edit my profile information, so that my account details are up to date.

**Acceptance Criteria:**
- **Given** I am logged in on the Profile screen **Then** I see my current profile details
- **When** I tap "Edit Profile" **Then** I can update my name, phone, and photo
- **And** photos are resized and stored in cloud storage
- **And** success toast displays "Profile updated"

### Story 2.5: Implement Saved Payment Methods
As a frequent traveler, I want to save my payment methods securely, so that checkout is faster on future bookings.

**Acceptance Criteria:**
- **Given** I am logged in on the Payment Methods screen **When** I add a new card **Then** card details are tokenized (PCI compliant)
- **And** only last 4 digits and card brand are stored locally
- **And** I can set a default card and delete methods

### Story 2.6: Enable Cross-Device Profile Sync with Spark KV
As a traveler using multiple devices, I want my profile and preferences synced automatically, so that I have a consistent experience across devices.

**Acceptance Criteria:**
- **Given** I am logged in on Device A **When** I update my profile **Then** changes are persisted to Spark useKV and synced to backend
- **When** I login on Device B **Then** my profile data is loaded from backend
- **And** sync works offline using queuing logic
