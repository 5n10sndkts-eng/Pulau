# Story 33.2: Single-Screen Onboarding Redesign

Status: ready-for-dev

## Story

As a **New User**,
I want to **set my travel preferences quickly on a single screen**,
So that **I can start discovering relevant experiences immediately without answering a long survey.**

## Acceptance Criteria

### AC 1: Entry Condition
**Given** the user launches the app
**And** no user preferences exist in the local store
**Then** the app should redirect to the `/onboarding` route
**And** display the Single-Screen Onboarding interface

### AC 2: Quick Selection UI
**Given** the user is on the Onboarding screen
**Then** they should see three clearly distinct sections: "Vibe", "Who are you with?", and "Budget"
**And** selections should be made with single taps on large, friendly chips/buttons
**And** "Vibe" should allow multiple selections
**And** "Group" and "Budget" should be single-select

### AC 3: Default States & Validation
**Given** the screen loads
**Then** "Start Planning" button should be disabled until at least one option in each category is selected OR defaults are pre-selected
**But** a "Skip & Explore" text link should be available to bypass immediately

### AC 4: Persistence
**Given** the user clicks "Start Planning"
**Then** the selected preferences object `{ travelStyles, groupType, budget }` should be saved to the Key-Value store
**And** the user should be redirected to the Home screen

### AC 5: Skip Logic
**Given** the user clicks "Skip & Explore"
**Then** default preferences (Adventure + Solo + Mid-Range) should be saved invisibly
**And** the user should be redirected to the Home screen
**And** an event `onboarding_skipped` should be logged

## Tasks / Subtasks

### Task 1: Create Onboarding Screen Layout (AC: #2)
- [ ] Create `src/components/OnboardingSingleScreen.tsx`
- [ ] Implement the 3-section layout using shadcn/ui Cards or simple div blocks
- [ ] Create `SelectionChip` components for the options

### Task 2: Implement Selection Logic (AC: #2, #3)
- [ ] Use `useState` to track selections
- [ ] Implement toggle for "Vibe" (array) and select for "Group"/"Budget" (string)
- [ ] Add validation logic to enable/disable main CTA

### Task 3: Value Persistence (AC: #4, #5)
- [ ] Connect `savePreferences` function from `usePreferences` hook (or equivalent)
- [ ] Implement "Smart Defaults" object for the skip handler
- [ ] Add routing redirect to `/` after save

### Task 4: Integration & Testing (All ACs)
- [ ] Update `App.tsx` routing to check for `!preferences` and route to this new screen
- [ ] **Crucial:** Ensure this replaces the old multi-step wizard if one exists
- [ ] Verify persistence works by reloading the app (should go to Home)

## Dev Notes

### Component Structure
```typescript
const ONBOARDING_DEFAULTS = {
  travelStyles: ['adventure'],
  groupType: 'solo',
  budget: 'midrange'
};

function Onboarding() {
  const [preferences, setPreferences] = useState({});
  
  const handleSave = () => {
    // Save to KV store
    saveUserPreferences(preferences);
    navigate('/');
  };

  return (
     <div className="p-6">
        <h1>Build your dream trip</h1>
        {/* Sections... */}
     </div>
  );
}
```
