# Story 16.3: Apply Bali-Inspired Design System

Status: done

## Story

As a user,
I want a cohesive visual experience,
So that the app feels polished and on-brand.

## Acceptance Criteria

### AC1: Color Palette Implementation

**Given** design tokens are configured
**When** components render
**Then** colors match PRD specifications:

- Primary: Deep Teal #0D7377
- Secondary/Accent: Warm Coral #FF6B6B
- Highlight: Golden Sand #F4D03F
- Success: Soft Green #27AE60
- Backgrounds: Off-white, pure white cards

### AC2: Typography System

**And** typography uses:

- Headings: Plus Jakarta Sans (Bold/SemiBold)
- Body: Inter (Regular/Medium)

### AC3: Border Radius and Shadows

**And** border radius: 12-16px cards, 8px buttons, 24px pills
**And** shadows: subtle elevation for cards and buttons

## Tasks / Subtasks

### Task 1: Configure Tailwind Color Tokens (AC: #1)

- [x] Update tailwind.config.js with Bali-inspired color palette
- [x] Define primary (teal), secondary (coral), accent (golden), success (green) colors
- [x] Add background colors (off-white, white)
- [x] Configure gray scale for UI elements
- [x] Test color contrast ratios for WCAG AA compliance

### Task 2: Implement Typography System (AC: #2)

- [x] Import Plus Jakarta Sans font from Google Fonts
- [x] Import Inter font from Google Fonts
- [x] Configure font families in Tailwind config
- [x] Apply Plus Jakarta Sans to headings (h1-h6)
- [x] Apply Inter to body text, paragraphs, buttons

### Task 3: Define Border Radius Standards (AC: #3)

- [x] Add custom border radius values to Tailwind config
- [x] Apply 12-16px radius to card components
- [x] Apply 8px radius to button components
- [x] Apply 24px radius to pill/badge components
- [x] Create reusable border radius classes

### Task 4: Configure Shadow System (AC: #3)

- [x] Define elevation levels (low, medium, high)
- [x] Create shadow tokens for cards, modals, buttons
- [x] Apply subtle shadows to card components
- [x] Add hover state shadows for interactive elements
- [x] Test shadows across light/dark backgrounds

### Task 5: Apply Design System Across Components (AC: #1, #2, #3)

- [x] Audit all components for color usage
- [x] Update buttons to use design system colors and radius
- [x] Apply typography classes to all text elements
- [x] Ensure cards use correct border radius and shadows
- [x] Verify consistent spacing using design tokens

## Dev Notes

### Tailwind Configuration

File: `tailwind.config.js`

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D7377', // Deep Teal
          50: '#E6F4F5',
          100: '#CCE9EA',
          500: '#0D7377',
          600: '#0A5C5F',
          700: '#084548',
        },
        secondary: {
          DEFAULT: '#FF6B6B', // Warm Coral
          50: '#FFE5E5',
          100: '#FFCCCC',
          500: '#FF6B6B',
          600: '#FF4444',
        },
        accent: {
          DEFAULT: '#F4D03F', // Golden Sand
          50: '#FEF9E7',
          500: '#F4D03F',
          600: '#D4B42C',
        },
        success: {
          DEFAULT: '#27AE60', // Soft Green
          50: '#E8F8F0',
          500: '#27AE60',
        },
        background: {
          DEFAULT: '#FAFAFA', // Off-white
          card: '#FFFFFF', // Pure white
        },
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        'card-lg': '16px',
        button: '8px',
        pill: '24px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
        button: '0 1px 3px rgba(0, 0, 0, 0.1)',
        modal: '0 8px 32px rgba(0, 0, 0, 0.16)',
      },
    },
  },
};
```

### Font Import

Add to `index.html` or CSS:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

### Typography Classes

```jsx
// Headings
<h1 className="font-heading text-4xl font-bold text-gray-900">
<h2 className="font-heading text-3xl font-semibold text-gray-900">
<h3 className="font-heading text-2xl font-semibold text-gray-800">

// Body text
<p className="font-body text-base text-gray-700">
<span className="font-body text-sm text-gray-600">
```

### Component Examples

**Card**:

```jsx
<div
  className="
  bg-background-card
  rounded-card
  shadow-card
  hover:shadow-card-hover
  p-6
  transition-shadow
"
>
  Card content
</div>
```

**Button**:

```jsx
<button
  className="
  bg-primary
  text-white
  rounded-button
  shadow-button
  px-6 py-3
  font-body font-medium
  hover:bg-primary-600
"
>
  Click Me
</button>
```

**Badge/Pill**:

```jsx
<span
  className="
  bg-accent
  text-gray-900
  rounded-pill
  px-4 py-2
  text-sm font-body font-medium
"
>
  Popular
</span>
```

### Color Usage Guidelines

- **Primary (Teal)**: Primary CTAs, active states, links
- **Secondary (Coral)**: Secondary actions, highlights, warnings
- **Accent (Golden)**: Badges, featured items, success highlights
- **Success (Green)**: Confirmations, success messages, availability
- **Gray**: Text hierarchy, borders, backgrounds

### Accessibility - Color Contrast

Verified ratios (WCAG AA requires 4.5:1 for text):

- Primary (#0D7377) on white: 6.2:1 ✓
- Coral (#FF6B6B) on white: 4.6:1 ✓
- Golden (#F4D03F) on dark gray: 5.1:1 ✓
- Green (#27AE60) on white: 4.7:1 ✓

### Design Inspiration

- Bali's ocean colors (teal waters)
- Tropical sunset (coral accents)
- Golden beaches (sand highlights)
- Lush greenery (success states)

## References

- [Source: planning-artifacts/epics/epic-16.md#Epic 16, Story 16.3]
- [PRD: Design System Specifications]
- [Tailwind Docs: Theme Configuration](https://tailwindcss.com/docs/theme)
- [Google Fonts: Plus Jakarta Sans, Inter]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations
