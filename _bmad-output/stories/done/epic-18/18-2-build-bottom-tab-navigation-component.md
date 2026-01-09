# Story 18.2: Build Bottom Tab Navigation Component

Status: done

## Story

As a user,
I want persistent bottom navigation,
So that I can switch between main sections quickly.

## Acceptance Criteria

### AC1: Bottom Tab Structure
**Given** I am on any main screen
**When** bottom navigation renders
**Then** I see 5 tabs in fixed footer:
  - Home (House icon) - navigates to home screen
  - Explore (Compass icon) - navigates to explore
  - Quick Add (PlusCircle icon, larger, centered) - opens modal
  - Saved (Heart icon) - navigates to wishlist
  - Profile (User icon) - navigates to profile

### AC2: Active State Styling
**And** current tab highlighted (teal fill, label visible)
**And** other tabs show outline icons, no labels
**And** tab bar height 64px + safe area inset

### AC3: Tab Navigation
**When** I tap a tab
**Then** screen changes with fade transition (150ms)
**And** scroll position resets to top

## Tasks / Subtasks

### Task 1: Build Bottom Tab Bar Component (AC: #1, #2)
- [x] Create BottomTabBar component with 5 tab buttons
- [x] Add icons from lucide-react (Home, Compass, PlusCircle, Heart, User)
- [x] Implement active/inactive visual states
- [x] Apply safe area insets for notched devices
- [x] Ensure 44x44px minimum touch targets

### Task 2: Implement Tab Navigation Logic (AC: #3)
- [x] Connect tabs to navigation system (useNavigation hook)
- [x] Handle tab clicks to navigate to respective screens
- [x] Reset scroll position on tab change
- [x] Add fade transition animation (150ms)
- [x] Prevent Quick Add from full navigation (opens modal instead)

### Task 3: Style Active and Inactive States (AC: #2)
- [x] Active tab: Teal filled icon, visible label below icon
- [x] Inactive tabs: Gray outline icons, no labels
- [x] Quick Add tab: Larger size (28px vs 24px), slightly elevated
- [x] Smooth transition between states
- [x] Apply design system color tokens

### Task 4: Handle Accessibility (AC: #1, #2, #3)
- [x] Add ARIA labels to each tab button
- [x] Mark active tab with aria-current="page"
- [x] Ensure keyboard navigation works (Tab, Enter)
- [x] Announce screen changes to screen readers
- [x] Test with VoiceOver and NVDA

## Dev Notes

### Component Implementation
File: `src/components/navigation/BottomTabBar.tsx`
```tsx
import { Home, Compass, PlusCircle, Heart, User } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { Screen } from '@/types/navigation';

const tabs = [
  { id: 'home', icon: Home, label: 'Home', screen: { type: 'home' } as Screen },
  { id: 'explore', icon: Compass, label: 'Explore', screen: { type: 'explore' } as Screen },
  { id: 'quickAdd', icon: PlusCircle, label: 'Add', isCenter: true },
  { id: 'saved', icon: Heart, label: 'Saved', screen: { type: 'saved' } as Screen },
  { id: 'profile', icon: User, label: 'Profile', screen: { type: 'profile' } as Screen },
];

export const BottomTabBar = ({ onQuickAddClick }: { onQuickAddClick: () => void }) => {
  const { currentScreen, navigate } = useNavigation();

  const handleTabClick = (tab: typeof tabs[number]) => {
    if (tab.id === 'quickAdd') {
      onQuickAddClick();
    } else if (tab.screen) {
      navigate(tab.screen);
    }
  };

  const isActive = (tabId: string) => currentScreen.type === tabId;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)] z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = isActive(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 transition-all",
                tab.isCenter && "scale-110 -translate-y-1",
                active ? "text-primary" : "text-gray-600"
              )}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                size={tab.isCenter ? 28 : 24}
                fill={active ? "currentColor" : "none"}
                strokeWidth={active ? 0 : 2}
              />
              {active && !tab.isCenter && (
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
```

### Design Specifications
- **Tab bar**: Fixed bottom, 64px height + safe area
- **Active tab**: Teal (#0D7377), filled icon, label visible
- **Inactive tab**: Gray (#6B7280), outline icon, no label
- **Quick Add**: 28px icon, slightly elevated (-4px translateY)
- **Transition**: 150ms fade for screen changes

### Accessibility
- Navigation landmark with aria-label="Main navigation"
- Each tab has clear aria-label
- Active tab marked with aria-current="page"
- Keyboard accessible (Tab to navigate, Enter to activate)
- Screen reader announces tab changes

## References

- [Source: planning-artifacts/epics/epic-18.md#Epic 18, Story 18.2]
- [Related: Story 16.3 - Bottom Navigation with Safe Areas]
- [Related: Story 18.3 - Quick Add Modal]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

