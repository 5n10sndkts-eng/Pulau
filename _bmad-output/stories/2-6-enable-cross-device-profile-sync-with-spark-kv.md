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
