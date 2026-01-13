# Story 16.3: Implement Bottom Navigation with Safe Areas

Status: ready-for-dev

## Story

As a mobile user,
I want easy-to-reach navigation,
So that I can navigate with one hand.

## Acceptance Criteria

### AC1: Bottom Navigation Structure

**Given** I am using the app on mobile
**When** bottom navigation renders
**Then** tab bar is fixed at bottom, 64px height
**And** safe area inset applied for notched phones (env(safe-area-inset-bottom))

### AC2: Tab Configuration

**And** 5 tabs: Home (House), Explore (Compass), Quick Add (PlusCircle), Saved (Heart), Profile (User)
**And** active tab highlighted with teal color and filled icon
**And** inactive tabs show outline icons in gray

### AC3: Quick Add Modal

**When** I tap Quick Add (center)
**Then** modal/sheet opens for category selection (not a separate screen)

## Tasks / Subtasks

### Task 1: Build Bottom Navigation Component (AC: #1, #2)

- [ ] Create BottomNavigation component with fixed positioning
- [ ] Set base height to 64px with additional safe area padding
- [ ] Apply `env(safe-area-inset-bottom)` for notched devices
- [ ] Add 5 tab items with icons and labels
- [ ] Implement active/inactive state styling

### Task 2: Configure Tab Items and Icons (AC: #2)

- [ ] Home tab: House icon, navigates to home/trip screen
- [ ] Explore tab: Compass icon, navigates to explore/bobjectse
- [ ] Quick Add tab: PlusCircle icon (larger, centered), opens modal
- [ ] Saved tab: Heart icon, navigates to wishlist
- [ ] Profile tab: User icon, navigates to profile
- [ ] Import icons from lucide-react library

### Task 3: Implement Active/Inactive States (AC: #2)

- [ ] Active tab: Teal (#0D7377) filled icon, visible label
- [ ] Inactive tabs: Gray outline icons, hidden labels (icon only)
- [ ] Quick Add: Always prominent (slightly larger, elevated)
- [ ] Add smooth transition animations between states
- [ ] Ensure only one tab active at a time

### Task 4: Handle Safe Areas for Notched Devices (AC: #1)

- [ ] Add CSS for safe area inset: `padding-bottom: env(safe-area-inset-bottom)`
- [ ] Test on iPhone with notch (iPhone X, 11, 12, 13, 14 series)
- [ ] Test on Android devices with gesture navigation
- [ ] Ensure content not hidden by home indicator
- [ ] Add fallback padding for devices without safe area support

### Task 5: Integrate Quick Add Modal (AC: #3)

- [ ] Create state management for Quick Add modal visibility
- [ ] On Quick Add tab tap, open modal (don't navigate)
- [ ] Pass category selection handler to modal
- [ ] Close modal after category selected
- [ ] Ensure other tabs navigate normally (not modals)

## Dev Notes

### Component Structure

File: `src/components/navigation/BottomNavigation.tsx`

```tsx
const BottomNavigation = ({ currentScreen, onNavigate }) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  return (
    <>
      <nav
        className="
        fixed bottom-0 left-0 right-0
        h-16
        pb-[env(safe-area-inset-bottom)]
        bg-white border-t border-gray-200
        flex items-center justify-around
        z-50
      "
      >
        <TabItem icon={Home} label="Home" active={currentScreen === 'home'} />
        <TabItem
          icon={Compass}
          label="Explore"
          active={currentScreen === 'explore'}
        />
        <TabItem
          icon={PlusCircle}
          label="Add"
          isCenter
          onClick={() => setShowQuickAdd(true)}
        />
        <TabItem
          icon={Heart}
          label="Saved"
          active={currentScreen === 'saved'}
        />
        <TabItem
          icon={User}
          label="Profile"
          active={currentScreen === 'profile'}
        />
      </nav>

      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
      />
    </>
  );
};
```

### TabItem Component

```tsx
const TabItem = ({ icon: Icon, label, active, isCenter, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center',
        'min-w-[44px] min-h-[44px] px-3',
        isCenter && 'scale-110 -translate-y-1',
        active ? 'text-teal-600' : 'text-gray-600',
      )}
    >
      <Icon
        size={isCenter ? 28 : 24}
        fill={active ? 'currentColor' : 'none'}
        strokeWidth={active ? 0 : 2}
      />
      {active && !isCenter && <span className="text-xs mt-1">{label}</span>}
    </button>
  );
};
```

### Safe Area CSS

```css
/* Global styles for safe area support */
:root {
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
}

/* Bottom navigation with safe area */
.bottom-nav {
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
}

/* Ensure viewport meta tag supports safe areas */
/* In HTML: <meta name="viewport" content="viewport-fit=cover"> */
```

### Viewport Meta Tag

Ensure `index.html` has:

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, viewport-fit=cover"
/>
```

### Testing Devices

- **iPhone 14 Pro Max**: 44px home indicator
- **iPhone 14 Pro**: 34px home indicator
- **iPhone SE**: 0px (no notch)
- **Android Pixel 6**: Gesture navigation bar
- **Samsung Galaxy**: Navigation bar variations

### Design Specifications

- **Tab bar height**: 64px base + safe area
- **Quick Add elevation**: Slightly raised (-4px translateY)
- **Icon sizes**: Regular tabs 24px, Quick Add 28px
- **Active color**: Teal #0D7377
- **Inactive color**: Gray #6B7280
- **Border**: Top border 1px solid #E5E7EB

### Accessibility

- Each tab button meets 44x44px touch target
- ARIA labels: "Home tab", "Explore tab", etc.
- ARIA current: active tab has `aria-current="page"`
- Keyboard navigation: Tab through items, Enter to activate
- Screen reader: Announce tab changes

## References

- [Source: epics.md#Epic 16, Story 16.3]
- [Related: Story 18.2 - Bottom Tab Navigation Component]
- [iOS Safe Area: env()](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)
- [Design: Bottom Navigation Pattern]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
