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
