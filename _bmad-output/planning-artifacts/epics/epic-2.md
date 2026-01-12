## Epic 2: User Authentication & Profile Management

**Goal:** Customers create accounts, login securely, manage profiles with saved payment methods, and access personalized features with cross-device synchronization.

### Story 2.1: Implement Customer Registration with Secure Backend

As a traveler,
I want to create an account with email and password,
So that I can save my trips and preferences securely.

**Acceptance Criteria:**

**Given** I am on the registration screen
**When** I enter valid email, password (min 8 chars), and confirm password
**Then** Supabase Auth client is initialized if not configured
**And** a new user account is created via Supabase Auth API
**And** user profile record is created in public.users table
**And** password is securely hashed by Supabase Auth service
**And** user receives email verification via Supabase Auth templates
**And** user record includes: id (UUID), email, created_at, email_verified (boolean)
**And** RLS policies are enforced for user data access
**And** I am redirected to the onboarding flow with authenticated session
**And** validation shows errors for: invalid email format, password too short, passwords don't match

### Story 2.2: Implement Customer Login with Session Management

As a registered traveler,
I want to login with my email and password,
So that I can access my saved trips and profile.

**Acceptance Criteria:**

**Given** I have a registered account from Story 2.1
**When** I enter correct email and password on login screen
**Then** my credentials are verified against hashed password in database
**And** a secure session token (JWT) is generated with 7-day expiration
**And** session token is stored in localStorage and HTTP-only cookie
**And** I am redirected to the home screen with authenticated state
**And** error message displays for incorrect email or password
**And** session automatically refreshes before expiration
**And** session expires and redirects to login after 7 days of inactivity

### Story 2.3: Implement Password Reset Flow

As a traveler who forgot my password,
I want to reset my password via email,
So that I can regain access to my account.

**Acceptance Criteria:**

**Given** I am on the "Forgot Password" screen
**When** I enter my registered email address
**Then** a password reset token (UUID) is generated and stored with 1-hour expiration
**And** a reset email is sent with a secure link containing the token
**When** I click the reset link and enter a new password (min 8 chars)
**Then** the token is validated (not expired, matches user)
**And** my password is updated with new hashed value
**And** all existing sessions are invalidated
**And** I receive confirmation and am redirected to login
**And** error shows for expired or invalid tokens

### Story 2.4: Create User Profile Management Interface

As a logged-in traveler,
I want to view and edit my profile information,
So that my account details are up to date.

**Acceptance Criteria:**

**Given** I am logged in and navigate to Profile screen
**When** the profile screen loads
**Then** I see my current profile: first name, last name, email, profile photo, member since date
**When** I tap "Edit Profile"
**Then** I can update: first name, last name, phone number, nationality
**And** I can upload a new profile photo (max 5MB, JPG/PNG)
**And** photo is resized to 400x400px and stored in cloud storage
**And** changes are saved to user_profiles table (user_id, first_name, last_name, phone, nationality, photo_url)
**And** success toast displays "Profile updated"
**And** validation prevents saving empty first/last name

### Story 2.5: Implement Saved Payment Methods

As a frequent traveler,
I want to save my payment methods securely,
So that checkout is faster on future bookings.

**Acceptance Criteria:**

**Given** I am logged in and on the Payment Methods settings screen
**When** I add a new payment method (credit card)
**Then** card details are tokenized via payment gateway (Stripe/PayPal) without storing raw card numbers
**And** only last 4 digits and card brand (Visa/Mastercard) are stored in payment_methods table
**And** payment_methods table includes: user_id, payment_token, last_four, card_brand, expiry_month, expiry_year, is_default
**When** I set a card as default
**Then** is_default flag updates, and only one card can be default
**When** I delete a payment method
**Then** the record is soft-deleted (deleted_at timestamp)
**And** I can add multiple payment methods
**And** PCI compliance is maintained (no raw card data stored)

### Story 2.6: Enable Cross-Device Profile Sync with Spark KV

As a traveler using multiple devices,
I want my profile and preferences synced automatically,
So that I have a consistent experience across devices.

**Acceptance Criteria:**

**Given** I am logged in on Device A
**When** I update my profile or preferences
**Then** changes are persisted to Spark useKV localStorage
**And** changes are also synced to backend user_profiles table
**When** I login on Device B with the same account
**Then** my profile data is loaded from backend on initial login
**And** subsequent changes on Device B sync via useKV and backend
**And** last_synced_at timestamp tracks sync state
**And** conflicts are resolved using "last write wins" strategy
**And** sync works offline (queues updates until network returns)

---
