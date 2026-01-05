# Pulau - Component Inventory

## Overview

This document catalogs all React components in the Pulau application, organized by category and purpose.

## Component Categories

| Category | Count | Description |
|----------|-------|-------------|
| Screen Components | 9 | Top-level screen views |
| Feature Components | 7 | Domain-specific features |
| UI Components | 46 | Reusable UI primitives |
| Utility Components | 4 | Helper/wrapper components |

---

## Screen Components

### Main Application Screens

| Component | File | Purpose |
|-----------|------|---------|
| `Onboarding` | `src/components/Onboarding.tsx` | 3-step user preference capture |
| `HomeScreen` | `src/components/HomeScreen.tsx` | Main landing with category grid |
| `CategoryBrowser` | `src/components/CategoryBrowser.tsx` | Experience listing with filters |
| `ExperienceDetail` | `src/components/ExperienceDetail.tsx` | Full experience page |
| `TripBuilder` | `src/components/TripBuilder.tsx` | Trip itinerary view |
| `TripsDashboard` | `src/components/TripsDashboard.tsx` | Booking history management |

### Checkout Flow Screens

| Component | File | Purpose |
|-----------|------|---------|
| `CheckoutFlow` | `src/components/checkout/CheckoutFlow.tsx` | Checkout orchestrator |
| `ReviewStep` | `src/components/checkout/ReviewStep.tsx` | Order review |
| `TravelerDetailsStep` | `src/components/checkout/TravelerDetailsStep.tsx` | Traveler info form |
| `PaymentStep` | `src/components/checkout/PaymentStep.tsx` | Payment collection |
| `ConfirmationStep` | `src/components/checkout/ConfirmationStep.tsx` | Booking confirmation |
| `CheckoutProgress` | `src/components/checkout/CheckoutProgress.tsx` | Progress indicator |

---

## Feature Components

### Embedded in Screen Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ExperienceCard` | `CategoryBrowser.tsx` | Experience preview card |
| Category Cards | `HomeScreen.tsx` | Category navigation tiles |
| Trip Preview | `HomeScreen.tsx` | Mini trip summary |
| Trip Item Card | `TripBuilder.tsx` | Individual trip item |
| Booking Card | `TripsDashboard.tsx` | Booking summary |
| Review Card | `ExperienceDetail.tsx` | Customer review display |
| Provider Card | `ExperienceDetail.tsx` | Provider information |

---

## UI Components (shadcn/ui)

All UI components are located in `src/components/ui/` and follow the shadcn/ui pattern.

### Layout Components

| Component | File | Base |
|-----------|------|------|
| `Card` | `card.tsx` | Native |
| `Separator` | `separator.tsx` | Radix |
| `ScrollArea` | `scroll-area.tsx` | Radix |
| `AspectRatio` | `aspect-ratio.tsx` | Radix |
| `Resizable` | `resizable.tsx` | react-resizable-panels |
| `Sidebar` | `sidebar.tsx` | Custom |

### Form Components

| Component | File | Base |
|-----------|------|------|
| `Button` | `button.tsx` | Native |
| `Input` | `input.tsx` | Native |
| `Textarea` | `textarea.tsx` | Native |
| `Label` | `label.tsx` | Radix |
| `Checkbox` | `checkbox.tsx` | Radix |
| `RadioGroup` | `radio-group.tsx` | Radix |
| `Select` | `select.tsx` | Radix |
| `Switch` | `switch.tsx` | Radix |
| `Slider` | `slider.tsx` | Radix |
| `Form` | `form.tsx` | React Hook Form |
| `InputOTP` | `input-otp.tsx` | input-otp |

### Navigation Components

| Component | File | Base |
|-----------|------|------|
| `Tabs` | `tabs.tsx` | Radix |
| `NavigationMenu` | `navigation-menu.tsx` | Radix |
| `Menubar` | `menubar.tsx` | Radix |
| `Breadcrumb` | `breadcrumb.tsx` | Native |
| `Pagination` | `pagination.tsx` | Native |

### Overlay Components

| Component | File | Base |
|-----------|------|------|
| `Dialog` | `dialog.tsx` | Radix |
| `AlertDialog` | `alert-dialog.tsx` | Radix |
| `Sheet` | `sheet.tsx` | Radix + Vaul |
| `Drawer` | `drawer.tsx` | Vaul |
| `Popover` | `popover.tsx` | Radix |
| `Tooltip` | `tooltip.tsx` | Radix |
| `HoverCard` | `hover-card.tsx` | Radix |
| `ContextMenu` | `context-menu.tsx` | Radix |
| `DropdownMenu` | `dropdown-menu.tsx` | Radix |

### Feedback Components

| Component | File | Base |
|-----------|------|------|
| `Alert` | `alert.tsx` | Native |
| `Badge` | `badge.tsx` | Native |
| `Progress` | `progress.tsx` | Radix |
| `Skeleton` | `skeleton.tsx` | Native |
| `Sonner` (Toast) | `sonner.tsx` | Sonner |

### Data Display Components

| Component | File | Base |
|-----------|------|------|
| `Table` | `table.tsx` | Native |
| `Calendar` | `calendar.tsx` | react-day-picker |
| `Carousel` | `carousel.tsx` | embla-carousel |
| `Chart` | `chart.tsx` | Recharts |
| `Avatar` | `avatar.tsx` | Radix |
| `Accordion` | `accordion.tsx` | Radix |
| `Collapsible` | `collapsible.tsx` | Radix |
| `Command` | `command.tsx` | cmdk |
| `Toggle` | `toggle.tsx` | Radix |
| `ToggleGroup` | `toggle-group.tsx` | Radix |

---

## Component Dependencies Map

```
App.tsx
├── Toaster (sonner)
├── AnimatePresence (framer-motion)
├── Onboarding
│   ├── Button
│   ├── Card
│   └── Calendar
├── HomeScreen
│   ├── Card
│   ├── Button
│   └── motion.div
├── CategoryBrowser
│   ├── Button
│   ├── Card
│   ├── Badge
│   ├── ScrollArea
│   └── motion.div
├── ExperienceDetail
│   ├── Button
│   ├── Card
│   ├── Badge
│   ├── Separator
│   └── AnimatePresence
├── TripBuilder
│   ├── Button
│   └── Card
├── TripsDashboard
│   ├── Card
│   ├── Button
│   ├── Tabs
│   ├── Badge
│   ├── Separator
│   ├── ScrollArea
│   ├── AlertDialog
│   └── motion.div
└── CheckoutFlow
    ├── CheckoutProgress
    ├── ReviewStep
    │   ├── Button
    │   └── Card
    ├── TravelerDetailsStep
    │   ├── Form
    │   ├── Input
    │   └── Select
    ├── PaymentStep
    │   ├── Card
    │   ├── Button
    │   └── RadioGroup
    └── ConfirmationStep
        ├── Card
        └── Button
```

---

## Design System Components

### Button Variants

| Variant | Usage |
|---------|-------|
| `default` | Primary actions (teal filled) |
| `outline` | Secondary actions |
| `ghost` | Tertiary/icon buttons |
| `destructive` | Dangerous actions |

### Card Usage Patterns

| Pattern | Example |
|---------|---------|
| Interactive | Category cards, experience cards |
| Static | Trip summary, payment info |
| Highlighted | "Perfect for you" recommendation |
| Dashed | Unscheduled trip items |

### Badge Usage

| Type | Usage |
|------|-------|
| Default | Primary badges |
| Secondary | Provider names, categories |
| Outline | Status indicators |
| Custom (success/warning) | Booking status |

---

## Animation Components

The application uses Framer Motion for animations:

| Animation | Usage |
|-----------|-------|
| Page transitions | Screen changes (opacity fade) |
| Card hover | Experience cards (y translate + shadow) |
| Heart icon | Save toggle (scale bounce) |
| Image carousel | Experience gallery (swipe gestures) |
| List items | Staggered entry animations |
| Bottom bar | Slide-up entrance |

---

## Hooks Used

| Hook | Source | Purpose |
|------|--------|---------|
| `useKV` | @github/spark | Persistent state |
| `useState` | React | Local state |
| `useEffect` | React | Side effects |
| `useMobile` | Custom | Responsive detection |

---

*Generated by BMAD Document Project Workflow v1.2.0*
