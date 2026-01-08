# Story 2.4: Create User Profile Management Interface

Status: ready-for-dev

## Story

As a logged-in traveler,
I want to view and edit my profile information,
so that my account details are up to date.

## Acceptance Criteria

1. **Given** I am logged in and navigate to Profile screen **When** the profile screen loads **Then** I see my current profile: first name, last name, email, profile photo, member since date
2. **When** I tap "Edit Profile" **Then** I can update: first name, last name, phone number, nationality
3. I can upload a new profile photo (max 5MB, JPG/PNG)
4. Photo is resized to 400x400px and stored in cloud storage
5. Changes are saved to user_profiles KV namespace (user_id, first_name, last_name, phone, nationality, photo_url)
6. Success toast displays "Profile updated"
7. Validation prevents saving empty first/last name

## Tasks / Subtasks

- [ ] Task 1: Create profile display screen (AC: #1)
  - [ ] Create `src/screens/profile/ProfileScreen.tsx`
  - [ ] Display circular profile photo (80px) or placeholder avatar
  - [ ] Show full name (first + last)
  - [ ] Show email address (read-only)
  - [ ] Show "Member since" formatted date
  - [ ] Add "Edit Profile" button
- [ ] Task 2: Create edit profile screen (AC: #2, #7)
  - [ ] Create `src/screens/profile/EditProfileScreen.tsx`
  - [ ] Build form with first name, last name, phone, nationality inputs
  - [ ] Pre-fill form with current profile data
  - [ ] Add Zod validation: first/last name required
  - [ ] Add nationality dropdown with common countries
  - [ ] Add phone input with international format
- [ ] Task 3: Implement photo upload (AC: #3, #4)
  - [ ] Add profile photo with "Change Photo" overlay tap area
  - [ ] Open file picker for JPG/PNG (max 5MB validation)
  - [ ] Resize image to 400x400px on client side
  - [ ] Store photo as base64 in useKV (mock cloud storage)
  - [ ] Show upload progress indicator
  - [ ] Handle upload errors gracefully
- [ ] Task 4: Implement profile data model (AC: #5)
  - [ ] Define UserProfile type in `src/types/user.ts`
  - [ ] Include: user_id, first_name, last_name, phone, nationality, photo_url
  - [ ] Create profile storage in useKV
  - [ ] Link to User record via user_id
- [ ] Task 5: Implement save functionality (AC: #5, #6)
  - [ ] Create update profile handler
  - [ ] Validate required fields
  - [ ] Persist changes to useKV
  - [ ] Show "Profile updated" success toast
  - [ ] Navigate back to profile view screen

## Dev Notes

- Photo stored as base64 in useKV for MVP (no actual cloud storage)
- Use canvas API for client-side image resizing
- Email is read-only in edit form (contact support to change)
- International phone format: +1 234 567 8901

### References

- [Source: vendor-customer-auth-requirements.md]
- [Source: prd/pulau-prd.md#Profile Management]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

