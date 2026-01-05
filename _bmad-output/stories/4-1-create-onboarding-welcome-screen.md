# Story 4.1: Create Onboarding Welcome Screen

Status: ready-for-dev

## Story

As a new user opening the app,
I want to see a welcoming first impression,
so that I understand what the app offers.

## Acceptance Criteria

1. **Given** I am a first-time user who just registered **When** the onboarding flow starts **Then** Screen 1 displays a full-screen Bali hero image with subtle parallax
2. App logo "Pulau" is overlaid on image
3. Tagline "Build Your Bali Dream" displays below logo
4. Primary button "Get Started" is prominently displayed (teal background, white text)
5. **When** I tap "Get Started" **Then** I proceed to Screen 2 (Preference Selector)
6. Progress indicator shows "1 of 3" at top
7. Image loads with skeleton while fetching

## Tasks / Subtasks

- [ ] Task 1: Create welcome screen UI (AC: #1, #2, #3)
  - [ ] Create `src/screens/onboarding/WelcomeScreen.tsx`
  - [ ] Add full-screen background image container
  - [ ] Implement subtle parallax effect on scroll/touch
  - [ ] Overlay Pulau logo (centered, with shadow for contrast)
  - [ ] Add tagline "Build Your Bali Dream" below logo
  - [ ] Apply gradient overlay for text readability
- [ ] Task 2: Implement Get Started button (AC: #4, #5)
  - [ ] Add primary button with teal background, white text
  - [ ] Position at bottom of screen (safe area aware)
  - [ ] Add tap animation (scale 0.95 on press)
  - [ ] Navigate to Screen 2 on tap
- [ ] Task 3: Add progress indicator (AC: #6)
  - [ ] Create OnboardingProgress component
  - [ ] Show "1 of 3" dots/steps at top
  - [ ] Active step: filled teal circle
  - [ ] Inactive steps: outline circles
  - [ ] Animate indicator on screen change
- [ ] Task 4: Implement image loading (AC: #7)
  - [ ] Show skeleton placeholder while image loads
  - [ ] Fade in image when loaded
  - [ ] Handle image load errors gracefully
  - [ ] Use optimized hero image (compressed, WebP if supported)
- [ ] Task 5: Create onboarding flow container
  - [ ] Create `src/screens/onboarding/OnboardingFlow.tsx`
  - [ ] Manage current step state
  - [ ] Handle navigation between 3 screens
  - [ ] Add slide transition animations between steps

## Dev Notes

- Hero image should be high quality but optimized (~500KB max)
- Parallax should be subtle (10-20px movement)
- Ensure text is readable over image with gradient overlay
- Follow mobile-first design (bottom 60% for primary actions)

### References

- [Source: epics.md#Story 4.1]
- [Source: prd/pulau-prd.md#Onboarding Flow]
- [Source: prd/pulau-prd.md#Design System]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

