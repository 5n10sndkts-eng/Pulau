# Pulau - Architecture Documentation

## Overview

Pulau is a React-based single-page application (SPA) built for the GitHub Spark platform. It implements a component-based architecture with screen-level state management and persistent storage via Spark KV.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    App.tsx (Root)                        │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │              Screen State Router                 │    │   │
│  │  │  (currentScreen: Screen union type)             │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                         │                                │   │
│  │  ┌──────────┬──────────┼──────────┬──────────┐         │   │
│  │  ▼          ▼          ▼          ▼          ▼         │   │
│  │ Onboarding  Home    Category  Experience   Trip        │   │
│  │            Screen   Browser    Detail     Builder      │   │
│  │                                              │          │   │
│  │                                              ▼          │   │
│  │                                         Checkout       │   │
│  │                                         Flow           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌───────────────────────────┼───────────────────────────────┐ │
│  │                    Shared Layer                            │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │ │
│  │  │ UI Comp │  │ Helpers │  │  Types  │  │MockData │      │ │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │ │
│  └────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                    GitHub Spark Platform                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    useKV Hook                            │   │
│  │  (pulau_user, pulau_current_trip, pulau_bookings)       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.0.0 | UI framework |
| TypeScript | 5.7.2 | Type safety |
| Vite | 7.2.6 | Build tool & dev server |

### Styling & UI
| Technology | Version | Purpose |
|------------|---------|---------|
| TailwindCSS | 4.1.11 | Utility-first CSS |
| Radix UI | Various | Accessible UI primitives |
| shadcn/ui | - | Component library |
| Framer Motion | 12.23.26 | Animations |

### State & Data
| Technology | Version | Purpose |
|------------|---------|---------|
| GitHub Spark KV | - | Persistent state storage |
| Zod | 4.3.4 | Schema validation |
| React Hook Form | 7.54.2 | Form management |

### Platform
| Technology | Purpose |
|------------|---------|
| GitHub Spark | Hosting & services platform |
| @github/spark | Platform SDK |

## Application Structure

### Screen-Based Navigation

The application uses a discriminated union type for screen state:

```typescript
type Screen =
  | { type: 'onboarding' }
  | { type: 'home' }
  | { type: 'category'; categoryId: string }
  | { type: 'experience'; experienceId: string }
  | { type: 'trip' }
  | { type: 'checkout' }
  | { type: 'explore' }
  | { type: 'saved' }
  | { type: 'profile' }
  | { type: 'trips' }
  | { type: 'tripDetail'; tripId: string }
```

### State Management

Three primary KV stores manage application state:

| Key | Type | Purpose |
|-----|------|---------|
| `pulau_user` | `User` | User preferences, saved items |
| `pulau_current_trip` | `Trip` | Active trip being built |
| `pulau_bookings` | `Booking[]` | Completed booking history |

### Component Hierarchy

```
App.tsx
├── Onboarding.tsx
├── HomeScreen.tsx
├── CategoryBrowser.tsx
├── ExperienceDetail.tsx
├── TripBuilder.tsx
├── TripsDashboard.tsx
└── checkout/
    ├── CheckoutFlow.tsx
    ├── CheckoutProgress.tsx
    ├── ReviewStep.tsx
    ├── TravelerDetailsStep.tsx
    ├── PaymentStep.tsx
    └── ConfirmationStep.tsx
```

## Data Flow

### User Journey Data Flow

```
Onboarding → User Preferences (KV)
     │
     ▼
HomeScreen ← Categories (mockData)
     │
     ▼
CategoryBrowser ← Experiences (mockData)
     │                    │
     ▼                    ▼
ExperienceDetail    Quick Add
     │                    │
     ▼                    ▼
Add to Trip ─────────────┘
     │
     ▼
Trip (KV) → TripBuilder
     │
     ▼
CheckoutFlow → Booking (KV)
     │
     ▼
TripsDashboard ← Bookings (KV)
```

### State Update Pattern

```typescript
// Example: Adding item to trip
const handleQuickAdd = (experience: Experience) => {
  const newItem: TripItem = {
    experienceId: experience.id,
    guests: 2,
    totalPrice: experience.price.amount * 2,
  }

  setTrip((current) => {
    const base = current || defaultTrip
    const updatedItems = [...base.items, newItem]
    const totals = calculateTripTotal(updatedItems)
    return {
      ...base,
      items: updatedItems,
      ...totals,
    }
  })
}
```

## Domain Model

### Core Entities

```typescript
// User entity
interface User {
  id: string
  preferences: UserPreferences
  saved: string[]
  currency: string
  language: string
  hasCompletedOnboarding?: boolean
}

// Trip entity
interface Trip {
  id: string
  userId: string
  destination: string
  startDate?: string
  endDate?: string
  travelers: number
  status: 'planning' | 'booked' | 'active' | 'completed' | 'cancelled'
  items: TripItem[]
  subtotal: number
  serviceFee: number
  total: number
}

// Experience entity
interface Experience {
  id: string
  title: string
  category: string
  provider: Provider
  price: { amount: number; currency: string; per: string }
  duration: string
  groupSize: { min: number; max: number }
  // ... additional fields
}
```

## Design Patterns

### 1. Container/Presentational Pattern
- Screen components handle state and logic
- UI components are presentational

### 2. Composition Pattern
- shadcn/ui components compose Radix primitives
- Checkout flow composes step components

### 3. Discriminated Union for Screens
- Type-safe screen navigation
- Exhaustive pattern matching

### 4. Functional Updates for State
- KV setters use functional updates
- Ensures correct state derivation

## Security Considerations

- No sensitive data stored client-side
- Form validation via Zod schemas
- Type-safe API interactions
- Content Security Policy via platform

## Performance Optimizations

- Vite for fast HMR in development
- Code splitting via dynamic imports
- Optimized bundle: 697KB (215KB gzipped)
- CSS: 376KB (68KB gzipped)

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│          GitHub Spark Platform          │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │         Static Assets           │   │
│  │  (HTML, JS, CSS, Images)        │   │
│  └─────────────────────────────────┘   │
│                  │                      │
│  ┌─────────────────────────────────┐   │
│  │       Spark KV Service          │   │
│  │  (Persistent State Storage)     │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---
*Generated by BMAD Document Project Workflow v1.2.0*
