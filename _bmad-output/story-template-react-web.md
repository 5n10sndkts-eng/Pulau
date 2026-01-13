# Story Template for Pulau (React Web + GitHub Spark)

**Purpose**: Use this template when creating new story documentation for the Pulau project. This template reflects the **actual tech stack** (React Web + GitHub Spark KV store), not React Native/Supabase.

**Last Updated**: January 6, 2026

---

# Story [Epic].[Number]: [Story Title]

Status: ready-for-dev

## Story

As a [user role],
I want to [action/goal],
So that I can [benefit/outcome].

## Acceptance Criteria

### AC 1: [Feature/Behavior Name]

**Given** [initial context/state]
**When** [action taken]
**Then** [expected result]
**And** [additional expected result]

### AC 2: [Feature/Behavior Name]

**Given** [initial context/state]
**When** [action taken]
**Then** [expected result]
**And** [additional expected result]

_[Continue with AC 3, AC 4, etc. as needed - typically 5-8 acceptance criteria per story]_

---

## Tasks / Subtasks

### Task 1: [Task Name] (AC: #1, #2)

- [ ] Create/modify component in `src/components/[ComponentName].tsx`
- [ ] Implement [specific functionality]
- [ ] Add [UI element] using shadcn/ui [Component]
- [ ] Style with Tailwind CSS classes
- [ ] Add Framer Motion animations if applicable

### Task 2: [Data Management Task] (AC: #3, #4)

- [ ] Use useKV hook to access GitHub Spark KV store
- [ ] Read/write data from `pulau_[key_name]` KV key
- [ ] Implement client-side filtering using JavaScript array methods
- [ ] Handle loading states during KV operations
- [ ] Add error handling with toast notifications

### Task 3: [Integration Task] (AC: #5, #6)

- [ ] Integrate component into existing view
- [ ] Update state management (useState/useContext)
- [ ] Add navigation using setCurrentScreen or routing
- [ ] Implement user feedback with Sonner toast
- [ ] Ensure immutable state updates (spread operators)

### Task 4: [Testing Task] (All ACs)

- [ ] Create test file `src/__tests__/[feature-name].test.ts`
- [ ] Write tests for each acceptance criterion
- [ ] Test edge cases and error states
- [ ] Verify all tests pass with `npm test`
- [ ] Update test count in completion notes

_[Add more tasks as needed - typically 4-7 tasks per story]_

---

## Dev Notes

### Component Implementation (React Web)

```typescript
// Example component structure
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export function ComponentName() {
  const [state, setState] = useState<Type>(initialValue);

  const handleAction = () => {
    // Implementation using React hooks
    setState(newValue);
    toast({ title: "Success message" });
  };

  return (
    <Card>
      <Button onClick={handleAction}>Action</Button>
    </Card>
  );
}
```

### Data Access Pattern (GitHub Spark KV Store)

```typescript
// Using useKV hook for data persistence
import { useKV } from '@github-spark';

function Component() {
  const [data, setData] = useKV<Type[]>('pulau_key_name', []);

  // Client-side filtering
  const filtered = data.filter(item => condition);

  // Client-side sorting
  const sorted = [...filtered].sort((a, b) => comparison);

  // Updating data (immutable)
  const addItem = (newItem: Type) => {
    setData([...data, newItem]);
  };

  return <div>{/* Render filtered/sorted data */}</div>;
}
```

### Browser API Usage (Web Platform)

```typescript
// Clipboard API
const handleCopy = async (text: string) => {
  await navigator.clipboard.writeText(text);
  toast({ title: 'Copied to clipboard' });
};

// External links
const openMap = (lat: number, lng: number) => {
  window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
};

// Email/Phone
const contactSupport = (email: string) => {
  window.open(`mailto:${email}?subject=Support Request`);
};
```

### State Management Pattern

```typescript
// Immutable state updates
const updateItem = (id: string, updates: Partial<Item>) => {
  setItems(
    items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
  );
};

// Atomic updates (no partial states)
const createTrip = (tripData: Trip) => {
  const newTrip = {
    ...tripData,
    id: `trip_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  setTrips([...trips, newTrip]);
};
```

### Component Library (shadcn/ui)

**Available Components**:

- Card, Button, Dialog, Sheet, Tabs, Badge, Separator, ScrollArea
- Form components: Input, Textarea, Select, Checkbox, RadioGroup
- Feedback: Toast (Sonner), AlertDialog
- Icons: Lucide React (e.g., `import { Check } from 'lucide-react'`)

**Styling**:

- Use Tailwind CSS 4 classes (e.g., `className="bg-primary text-white"`)
- Avoid CSS-in-JS or styled-components
- Use design tokens from `tailwind.config.ts`

### Testing Approach

```typescript
// Test file structure
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComponentName } from '@/components/ComponentName';

describe('Feature Name', () => {
  describe('AC 1: Feature behavior', () => {
    it('should [expected behavior]', () => {
      render(<ComponentName />);
      expect(screen.getByText('Expected text')).toBeInTheDocument();
    });
  });
});
```

### Performance Considerations

- Use React.memo for expensive components
- Implement lazy loading for route-based code splitting
- Add loading skeletons during data fetch
- Debounce search/filter inputs
- Optimize images with lazy loading

---

## References

- [Source: epics.md#Epic [X] - Story [X].[Y]]
- [Source: \_bmad-output/planning-artifacts/prd/pulau-prd.md#[Section]]
- [Related: Story [X].[Y] - [Related Story Title]]
- [Related: Story [X].[Z] - [Another Related Story]]

---

## Dev Agent Record

### Agent Model Used

_[e.g., GitHub Copilot - GPT-4o (2026-01-06)]_

### Implementation Notes

_[Document what was actually built, not what was planned. Be specific about:]_

- Component structure and file organization
- Data flow and state management approach
- UI/UX decisions and design choices
- Integration points with existing features
- Any deviations from original plan

**Example**:
The [feature name] was implemented in `src/components/[ComponentName].tsx` using shadcn/ui components. Key implementation details:

**Component Architecture**:

- Used React hooks (useState, useEffect) for local state
- Integrated with useKV hook for data persistence in KV store
- Implemented client-side filtering for [data type]

**UI Implementation**:

- Built with shadcn/ui [Component] component
- Styled with Tailwind CSS classes matching design system
- Added Framer Motion animations for [interaction]
- Used Sonner toast for user feedback

**Data Handling**:

- Data stored in `pulau_[key]` KV key as [Type][] array
- Filtering logic: [describe filter conditions]
- Sorting logic: [describe sort order]
- No database queries needed - all operations client-side

**Browser API Integration**:

- Used `navigator.clipboard` for copy functionality (AC #X)
- Used `window.open()` for external links (AC #Y)
- All operations work in modern browsers

### Debug Log References

_[Document any significant debugging or refinement work:]_

**Example**:

- Fixed TypeScript errors in [function] by adding [type annotations]
- Resolved Fast Refresh issue by extracting CVA variants
- Updated component to handle edge case when [condition]
- Refined [feature] based on UX testing

_Or if truly straightforward:_
No significant debugging required - implementation followed planned approach.

### Completion Notes List

✅ All [X] tasks and [Y] subtasks completed
✅ All acceptance criteria (AC 1-[X]) satisfied
✅ Component reuses existing [components] with enhancements
✅ Uses shadcn/ui [Component] for [feature]
✅ Uses Framer Motion for [animations]
✅ Uses useKV hook for state management
✅ [Feature-specific achievement]
✅ [Another feature-specific achievement]
✅ [X] new tests added, all passing ([Total] total tests pass)
✅ No linting errors

### Adversarial Code Review Completion (YYYY-MM-DD)

_[Only add this section after adversarial review is complete]_

**Reviewer**: Dev Agent (Sequential Review #[N] of 95)
**Issues Found**: [X] ([Y] HIGH, [Z] MEDIUM, [W] LOW)

**HIGH Severity Fixes**:

- [Description of high severity issue and fix]

**MEDIUM Severity Fixes**:

- [Description of medium severity issue and fix]

**LOW Severity Fixes**:

- [Description of low severity issue and fix]

All documentation now accurately reflects the React web implementation using GitHub Spark KV store.

### File List

- `src/components/[ComponentName].tsx` (created/modified)
- `src/__tests__/[test-name].test.ts` (created)
- `src/lib/[utility].ts` (modified - if applicable)

---

## Template Usage Guidelines

### ✅ DO:

1. Use React Web terminology (components, hooks, browser APIs)
2. Reference GitHub Spark KV store for data persistence
3. Use `src/` directory paths for file references
4. Reference shadcn/ui components (not Radix UI directly)
5. Use Lucide React for icons
6. Reference browser APIs (`navigator.clipboard`, `window.open`)
7. Keep test counts updated after implementation
8. Use correct PRD path: `_bmad-output/planning-artifacts/prd/pulau-prd.md`

### ❌ DON'T:

1. Reference React Native/Expo (this is a web app)
2. Reference Supabase database (use KV store instead)
3. Use `app/` directory paths (use `src/` instead)
4. Show database queries or SQL (use client-side filtering)
5. Reference database transactions (use immutable state updates)
6. Reference native mobile APIs (expo-clipboard, Linking, etc.)
7. Claim "no debugging required" without verification
8. Use outdated test counts

### Common Patterns to Follow:

**File Paths**:

- ✅ `src/components/TripsDashboard.tsx`
- ❌ `app/(tabs)/profile/my-trips.tsx`

**Data Access**:

- ✅ "Use useKV hook to access `pulau_bookings` KV key"
- ❌ "Query bookings table with Supabase"

**State Management**:

- ✅ "Update state using immutable spread operators"
- ❌ "Wrap in database transaction"

**Browser APIs**:

- ✅ `navigator.clipboard.writeText(text)`
- ❌ `Clipboard.setStringAsync(text)` (React Native)

**Component References**:

- ✅ "shadcn/ui Tabs component"
- ❌ "React Native Tab View"

---

## Reference Stories (Corrected Examples)

Use these as templates for accurate documentation:

1. `_bmad-output/stories/1-1-initialize-github-spark-project-with-typescript.md`
2. `_bmad-output/stories/11-1-create-booking-history-screen.md`
3. `_bmad-output/stories/11-2-build-booking-detail-view.md`
4. `_bmad-output/stories/11-3-implement-book-again-functionality.md`

All have been adversarially reviewed and corrected for architecture accuracy.

---

**Template Version**: 1.0  
**Last Updated**: January 6, 2026  
**Maintainer**: Dev Team  
**Status**: Ready for use in new story creation
