### Story 18.1: Implement Discriminated Union Screen Routing

As a developer,
I want type-safe screen routing,
So that navigation is predictable and bug-free.

**Acceptance Criteria:**

**Given** the app uses state-based routing (no react-router)
**When** Screen type is defined
**Then** discriminated union covers all screens:
```typescript
type Screen =
  | { type: 'home' }
  | { type: 'category'; categoryId: string }
  | { type: 'experience'; experienceId: string }
  | { type: 'tripBuilder' }
  | { type: 'checkout'; step: 1 | 2 | 3 | 4 }
  | { type: 'explore' }
  | { type: 'saved' }
  | { type: 'profile' }
  | { type: 'bookingHistory' }
  | { type: 'bookingDetail'; bookingId: string }
  | { type: 'settings'; section: string }
```
**And** App.tsx switches on screen.type to render correct component
**And** TypeScript ensures exhaustive handling
**And** invalid screens cause compile-time error
