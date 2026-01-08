# Story 16.2: Ensure Touch Target Compliance

Status: ready-for-dev

## Story

As a mobile user,
I want all interactive elements to be easily tappable,
So that I don't accidentally tap the wrong thing.

## Acceptance Criteria

### AC1: Touch Target Sizing
**Given** mobile users interact via touch
**When** interactive elements are rendered
**Then** all buttons, links, and tappable areas have minimum 44x44px touch target
**And** touch targets don't overlap

### AC2: Small Element Padding
**And** increased tap padding on small elements (icons, close buttons)
**And** audit tool confirms compliance
**And** Tailwind classes like `min-h-[44px] min-w-[44px]` applied where needed

## Tasks / Subtasks

### Task 1: Audit All Interactive Elements (AC: #1, #2)
- [ ] Create inventory of all tappable elements (buttons, links, icons, form inputs)
- [ ] Measure current touch target sizes using bobjectser dev tools
- [ ] Identify elements below 44x44px minimum
- [ ] Document components requiring updates
- [ ] Prioritize high-traffic elements (navigation, CTAs)

### Task 2: Apply Minimum Touch Target Sizing (AC: #1)
- [ ] Add `min-h-[44px] min-w-[44px]` to all button components
- [ ] Ensure link elements have sufficient padding (min 44x44px)
- [ ] Apply tap area expansion to icon buttons
- [ ] Update form inputs to meet minimum height requirements
- [ ] Add padding to checkbox and radio button tap areas

### Task 3: Increase Padding for Small Elements (AC: #2)
- [ ] Add extra padding to icon-only buttons (close, menu, settings)
- [ ] Wrap small icons in larger tappable containers
- [ ] Increase spacing between adjacent tappable elements (min 8px gap)
- [ ] Apply invisible tap padding using `p-3` or `p-4` on small icons
- [ ] Update card tap areas to include full card surface

### Task 4: Implement Audit Tooling (AC: #2)
- [ ] Install accessibility testing library (axe-core or similar)
- [ ] Create automated test to check touch target sizes
- [ ] Add visual debugging mode to highlight touch targets
- [ ] Generate compliance report for all interactive elements
- [ ] Set up CI/CD check to prevent regression

### Task 5: Test on Real Devices (AC: #1, #2)
- [ ] Test all interactive elements on iPhone (various sizes)
- [ ] Test on Android devices (various screen sizes)
- [ ] Verify no accidental taps on adjacent elements
- [ ] Test with different finger sizes (ask multiple people)
- [ ] Check KV namespacet touch targets work well (can be smaller on larger screens)

## Dev Notes

### Touch Target Standards
- **Minimum size**: 44x44px (iOS and Android guidelines)
- **Recommended size**: 48x48px for better accuracy
- **Spacing**: Minimum 8px between adjacent touch targets
- **Exception**: Inline text links can be smaller if not critical actions

### Tailwind Utility Classes
```jsx
// Button with minimum touch target
<button className="min-h-[44px] min-w-[44px] px-4">
  Click Me
</button>

// Icon button with expanded tap area
<button className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center">
  <Icon size={20} />
</button>

// Link with sufficient padding
<a href="#" className="inline-block py-3 px-4 min-h-[44px]">
  Link Text
</a>
```

### Component Updates
File: `src/components/ui/Button.tsx`
```typescript
const sizeVariants = {
  sm: "min-h-[44px] px-3 text-sm",      // Even small buttons meet minimum
  md: "min-h-[44px] px-4 text-base",    // Default size
  lg: "min-h-[56px] px-6 text-lg",      // Large buttons
};
```

### Audit Tool Implementation
```typescript
// Automated touch target checker
const checkTouchTargets = () => {
  const interactiveElements = document.querySelectorAll('button, a, input, [role="button"]');

  interactiveElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      console.warn('Touch target too small:', el, `${rect.width}x${rect.height}`);
    }
  });
};
```

### Visual Debug Mode
```jsx
// Add debug class to show touch target boundaries
<div className="debug-touch-targets">
  {/* All interactive elements get visible outline */}
</div>

// CSS for debug mode
.debug-touch-targets button,
.debug-touch-targets a,
.debug-touch-targets [role="button"] {
  outline: 2px dashed red;
  outline-offset: 2px;
}
```

### Common Patterns

**Icon Buttons**:
```jsx
<button className="p-3 rounded-full hover:bg-gray-100">
  <XIcon size={20} />
</button>
```

**Navigation Links**:
```jsx
<nav className="flex gap-2">
  <a className="px-4 py-3 min-h-[44px] flex items-center">Home</a>
  <a className="px-4 py-3 min-h-[44px] flex items-center">About</a>
</nav>
```

**Card Tap Areas**:
```jsx
<div className="cursor-pointer" onClick={handleClick}>
  <div className="p-4 min-h-[88px]"> {/* 2x minimum for content */}
    Card Content
  </div>
</div>
```

### Accessibility Benefits
- Easier for users with motor impairments
- Better experience for elderly users
- Reduces frustration from mis-taps
- Improves overall usability on mobile

## References

- [Source: planning-artifacts/epics/epic-16.md#Epic 16, Story 16.2]
- [iOS Human Interface Guidelines: Touch Targets](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/adaptivity-and-layout/)
- [Android Material Design: Touch Targets](https://material.io/design/usability/accessibility.html#layout-and-typography)
- [WCAG 2.1: Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
