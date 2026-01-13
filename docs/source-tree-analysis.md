# Pulau - Source Tree Analysis

## Directory Structure

```
/Users/moe/Pulau/
├── .agent/                          # Agent workflow configurations
│   └── workflows/bmad/              # BMAD workflow definitions
├── .claude/                         # Claude AI configurations
│   └── commands/bmad/bmm/agents/    # Agent command definitions
├── .github/                         # GitHub configurations
│   └── agents/                      # GitHub agent definitions
├── .opencode/                       # OpenCode configurations
├── .vscode/                         # VS Code settings
├── _bmad/                           # BMAD platform files
│   ├── bmm/                         # BMAD Module Manager
│   └── core/                        # BMAD Core
├── _bmad-output/                    # BMAD output artifacts
├── docs/                            # 📁 Generated documentation (output)
├── src/                             # 📁 Application source code
│   ├── components/                  # React components
│   │   ├── checkout/                # Checkout flow components
│   │   └── ui/                      # shadcn/ui components
│   ├── hooks/                       # Custom React hooks
│   ├── lib/                         # Utilities and data
│   └── styles/                      # Global styles
├── AUDIT_REPORT.md                  # Code audit documentation
├── LICENSE                          # MIT License
├── PRD.md                           # Product Requirements Document
├── README.md                        # Project readme
├── SECURITY.md                      # Security documentation
├── components.json                  # shadcn/ui configuration
├── eslint.config.js                 # ESLint configuration
├── index.html                       # HTML entry point
├── package.json                     # NPM dependencies
├── package-lock.json                # NPM lock file
├── spark.meta.json                  # GitHub Spark metadata
├── tailwind.config.js               # Tailwind configuration
├── theme.json                       # Theme customization
├── tsconfig.json                    # TypeScript configuration
└── vite.config.ts                   # Vite configuration
```

---

## Critical Directories

### `/src/` - Application Source

The main application code resides here:

```
src/
├── App.tsx                 # 🎯 Main application component (495 lines)
│                           #    - Screen state management
│                           #    - Navigation logic
│                           #    - State handlers
│                           #    - Bottom navigation
│
├── main.tsx               # Application entry point
├── ErrorFallback.tsx      # Error boundary fallback
│
├── components/            # React components
│   ├── Onboarding.tsx     # 317 lines - User onboarding flow
│   ├── HomeScreen.tsx     # 171 lines - Landing page
│   ├── CategoryBrowser.tsx # 242 lines - Experience listing
│   ├── ExperienceDetail.tsx # 374 lines - Experience page
│   ├── TripBuilder.tsx    # 251 lines - Trip management
│   ├── TripsDashboard.tsx # 505 lines - Booking history
│   │
│   ├── checkout/          # Multi-step checkout
│   │   ├── CheckoutFlow.tsx      # Flow orchestrator
│   │   ├── CheckoutProgress.tsx  # Progress indicator
│   │   ├── ReviewStep.tsx        # Order review
│   │   ├── TravelerDetailsStep.tsx # Form collection
│   │   ├── PaymentStep.tsx       # Payment UI
│   │   ├── ConfirmationStep.tsx  # Success screen
│   │   └── index.ts              # Barrel export
│   │
│   └── ui/                # 46 shadcn/ui components
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── aspect-ratio.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx
│       ├── context-menu.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── hover-card.tsx
│       ├── input-otp.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── navigation-menu.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── resizable.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toggle-group.tsx
│       ├── toggle.tsx
│       └── tooltip.tsx
│
├── hooks/
│   └── use-mobile.ts      # Mobile detection hook
│
├── lib/
│   ├── types.ts           # 133 lines - TypeScript interfaces
│   ├── mockData.ts        # 1069 lines - Sample data
│   ├── helpers.ts         # 224 lines - Utility functions
│   └── utils.ts           # 7 lines - cn() helper
│
└── styles/
    ├── index.css          # Global CSS imports
    ├── main.css           # Main stylesheet
    └── theme.css          # Theme variables (Radix colors)
```

---

## Entry Points

| File           | Purpose                     |
| -------------- | --------------------------- |
| `index.html`   | HTML template with root div |
| `src/main.tsx` | React app bootstrap         |
| `src/App.tsx`  | Main application component  |

### Application Bootstrap Flow

```
index.html
    │
    ▼
src/main.tsx
    │ ├── Import CSS (main.css, theme.css, index.css)
    │ ├── Import @github/spark/spark
    │ └── createRoot(#root)
    │
    ▼
<ErrorBoundary>
    │
    ▼
src/App.tsx
    │ ├── Initialize KV stores
    │ ├── Check onboarding status
    │ └── Render current screen
```

---

## Key Files by Function

### State Management

| File      | State Managed                       |
| --------- | ----------------------------------- |
| `App.tsx` | user, trip, bookings, currentScreen |

### Data Layer

| File              | Data Provided                         |
| ----------------- | ------------------------------------- |
| `lib/mockData.ts` | destinations, categories, experiences |
| `lib/types.ts`    | All TypeScript interfaces             |
| `lib/helpers.ts`  | Data transformation utilities         |

### Styling

| File                 | Purpose                     |
| -------------------- | --------------------------- |
| `styles/theme.css`   | CSS variables, Radix colors |
| `styles/main.css`    | Global styles               |
| `styles/index.css`   | Import aggregation          |
| `tailwind.config.js` | Tailwind customization      |

### Configuration

| File               | Purpose             |
| ------------------ | ------------------- |
| `vite.config.ts`   | Build configuration |
| `tsconfig.json`    | TypeScript settings |
| `eslint.config.js` | Linting rules       |
| `components.json`  | shadcn/ui settings  |

---

## File Statistics

| Category            | Files   | Lines of Code |
| ------------------- | ------- | ------------- |
| Screen Components   | 6       | ~1,860        |
| Checkout Components | 6       | ~1,700        |
| UI Components       | 46      | ~3,500        |
| Library Files       | 4       | ~1,433        |
| Styles              | 3       | ~300          |
| Configuration       | 5       | ~350          |
| **Total**           | **70+** | **~9,000+**   |

---

## Import Path Aliases

Configured in `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

Usage example:

```typescript
import { Button } from '@/components/ui/button';
import { Trip } from '@/lib/types';
```

---

## Build Output

After running `npm run build`:

```
dist/
├── assets/
│   ├── index-[hash].js      # Main bundle (~697KB)
│   └── index-[hash].css     # Styles (~376KB)
└── index.html               # Entry HTML
```

---

_Generated by BMAD Document Project Workflow v1.2.0_
