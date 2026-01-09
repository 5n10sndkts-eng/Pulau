# Epic 2: User Authentication & Profile Management

**Goal:** Provide a basic "Mock Authentication" experience that allows the core Traveler Journey (saving trips, booking) to function in the MVP, using the KV store for persistence.

**Phase:** Phase 1 (MVP)
**Dependencies:** Epic 1 (Foundation)
**Storage:** **Strictly KV Store** (GitHub Spark KV). No SQL/Supabase integration in this phase.

---

### Context & Strategy
Per the PRD, the MVP relies on a **Mock Auth Service**. We are NOT building real secure authentication, email verification, or password hashing in this phase. The goal is to simulate a logged-in state so that:
1.  We can test the "Authenticated Traveler" user flows (Profile, Saved Trips).
2.  The UI behaves *as if* a user is logged in.
3.  Data is stored in the KV store under a user-specific namespace `pulau_users_{id}`.

---

### Story 2.1: Implement Mock Auth Service
As a developer, I need a centralized service that mimics authentication behavior, so that the UI can react to "Logged In" and "Logged Out" states without a real backend.

**Acceptance Criteria:**
- **Given** the app initializes **Then** a global `AuthContext` is available
- **When** `login(email, password)` is called **Then** it accepts ANY valid email format and ANY password
- **And** it generates a mock `user` object (id, email, name)
- **And** it stores a mock `session_token` in localStorage
- **When** `logout()` is called **Then** the session token is removed and state is cleared
- **Technical Note:** This service must implement the same interface we plan to use for Supabase later, making the Phase 2 migration smoother.

### Story 2.2: Mock Registration & Login Screens
As a traveler, I want to see login and registration screens, so that I experience the app's flow even if the security is simulated.

**Acceptance Criteria:**
- **Given** I am on the Login Screen **When** I enter "test@example.com" / "password" **Then** I am successfully "logged in" and redirected to Home.
- **Given** I am on the Register Screen **When** I submit the form **Then** a new mock user ID is generated.
- **And** a new entry is created in the KV store key `pulau_users_{new_id}` with the profile data.
- **UI:** Use the agreed Design System components (Teal primary buttons, input fields with validation states).

### Story 2.3: Basic Profile Management (KV Store)
As a "logged-in" traveler, I want to edit my profile details, so that I can see my name on the booking confirmation.

**Acceptance Criteria:**
- **Given** I am logged in **When** I edit my "Name" or "Phone" in the Profile tab
- **Then** the app saves this JSON object to the KV store key `pulau_users_{id}`
- **And** the UI updates immediately to reflect the change.
- **Scope Limit:** No image uploading. Use a generated avatar (e.g., initializeds or DiceBear URL) based on the user's name.

### Story 2.4: Persist "Saved Trips" to User Account
As a traveler, I want my trips to be associated with my account, so that they persist when I reload the app.

**Acceptance Criteria:**
- **Given** I have a trip in progress **When** I am logged in
- **Then** the Trip ID is added to my user record in the KV store (`pulau_users_{id}.trips`)
- **And** reloading the browser restores my user session and my list of trips.

### Story 2.5: "Guest" vs "User" State Handling
As a user, I want the app to handle my data correctly whether I am a guest or logged in.

**Acceptance Criteria:**
- **Given** I am a Guest (not logged in) **Then** I can still browse and build a trip (stored in local app state/temp storage).
- **When** I finally "Log In" (Mock) **Then** my current temporary trip is associated with my new mock user ID.
