# Story 2.4: Create User Profile Management Interface

Status: done

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

- [x] Task 1: Create profile display screen (AC: #1)
  - [x] Create `src/screens/profile/ProfileScreen.tsx`
  - [x] Display circular profile photo (80px) or placeholder avatar
  - [x] Show full name (first + last)
  - [x] Show email address (read-only)
  - [x] Show "Member since" formatted date
  - [x] Add "Edit Profile" button
- [x] Task 2: Create edit profile screen (AC: #2, #7)
  - [x] Create `src/screens/profile/EditProfileScreen.tsx`
  - [x] Build form with first name, last name, phone, nationality inputs
  - [x] Pre-fill form with current profile data
  - [x] Add Zod validation: first/last name required
  - [x] Add nationality dropdown with common countries
  - [x] Add phone input with international format
- [x] Task 3: Implement photo upload (AC: #3, #4)
  - [x] Add profile photo with "Change Photo" overlay tap area
  - [x] Open file picker for JPG/PNG (max 5MB validation)
  - [x] Resize image to 400x400px on client side
  - [x] Store photo as base64 in useKV (mock cloud storage)
  - [x] Show upload progress indicator
  - [x] Handle upload errors gracefully
- [x] Task 4: Implement profile data model (AC: #5)
  - [x] Define UserProfile type in `src/types/user.ts`
  - [x] Include: user_id, first_name, last_name, phone, nationality, photo_url
  - [x] Create profile storage in useKV
  - [x] Link to User record via user_id
- [x] Task 5: Implement save functionality (AC: #5, #6)
  - [x] Create update profile handler
  - [x] Validate required fields
  - [x] Persist changes to useKV
  - [x] Show "Profile updated" success toast
  - [x] Navigate back to profile view screen

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

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations
