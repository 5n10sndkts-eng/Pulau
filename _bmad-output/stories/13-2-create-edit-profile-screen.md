### Story 13.2: Create Edit Profile Screen

As a user,
I want to edit my profile information,
So that my account details are current.

**Acceptance Criteria:**

**Given** I tap "Edit Profile" from profile screen
**When** the edit profile screen loads
**Then** I see form with current values:
  - Profile photo with "Change Photo" overlay
  - First Name input
  - Last Name input
  - Phone Number input
  - Email (read-only, displays "Contact support to change")
**When** I tap profile photo
**Then** options appear: "Take Photo", "Choose from Library", "Remove Photo"
**And** selected photo crops to square and uploads
**When** I save changes
**Then** user_profiles table updates
**And** toast displays "Profile updated"
**And** I return to profile screen with updated info
