# Pulau - State Management Documentation

## Overview

Pulau uses GitHub Spark's `useKV` hook for persistent state management. This provides a simple key-value store that persists across sessions when deployed on the Spark platform.

## State Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application State                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   pulau_user    │  │ pulau_current_  │  │  pulau_     │ │
│  │                 │  │     trip        │  │  bookings   │ │
│  │  • preferences  │  │  • items        │  │  • history  │ │
│  │  • saved items  │  │  • dates        │  │  • status   │ │
│  │  • settings     │  │  • totals       │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│           │                    │                    │       │
│           └────────────────────┴────────────────────┘       │
│                              │                              │
│                    ┌─────────▼─────────┐                   │
│                    │   GitHub Spark    │                   │
│                    │    KV Storage     │                   │
│                    └───────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## State Stores

### 1. User Store (`pulau_user`)

**Purpose**: Stores user preferences and personalization data.

```typescript
interface User {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  preferences: UserPreferences
  saved: string[]           // Saved experience IDs
  currency: string          // Default: 'USD'
  language: string          // Default: 'en'
  hasCompletedOnboarding?: boolean
}

interface UserPreferences {
  travelStyle?: 'adventure' | 'relaxation' | 'culture' | 'mix'
  groupType?: 'solo' | 'couple' | 'friends' | 'family'
  budget?: 'budget' | 'midrange' | 'luxury'
}
```

**Default Value**:
```typescript
const defaultUser: User = {
  id: 'user_demo',
  preferences: {},
  saved: [],
  currency: 'USD',
  language: 'en',
  hasCompletedOnboarding: false,
}
```

### 2. Trip Store (`pulau_current_trip`)

**Purpose**: Stores the active trip being planned.

```typescript
interface Trip {
  id: string
  userId: string
  destination: string       // e.g., 'dest_bali'
  startDate?: string        // ISO date
  endDate?: string          // ISO date
  travelers: number
  status: 'planning' | 'booked' | 'active' | 'completed' | 'cancelled'
  items: TripItem[]
  subtotal: number
  serviceFee: number
  total: number
  bookingReference?: string
  bookedAt?: string
  cancelledAt?: string
  cancellationReason?: string
}

interface TripItem {
  experienceId: string
  date?: string
  time?: string
  guests: number
  totalPrice: number
  notes?: string
}
```

**Default Value**:
```typescript
const defaultTrip: Trip = {
  id: 'trip_1',
  userId: 'user_demo',
  destination: 'dest_bali',
  travelers: 2,
  status: 'planning',
  items: [],
  subtotal: 0,
  serviceFee: 0,
  total: 0,
}
```

### 3. Bookings Store (`pulau_bookings`)

**Purpose**: Stores completed booking history.

```typescript
interface Booking {
  id: string
  tripId: string
  reference: string         // e.g., 'PUL-2025-A7B3C'
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  bookedAt: string          // ISO timestamp
  trip: Trip                // Snapshot of trip at booking time
}
```

**Default Value**: `[]`

---

## State Operations

### Reading State

```typescript
// In App.tsx
const [user, setUser] = useKV<User>('pulau_user', defaultUser)
const [trip, setTrip] = useKV<Trip>('pulau_current_trip', defaultTrip)
const [bookings, setBookings] = useKV<Booking[]>('pulau_bookings', [])

// Safe access pattern
const safeUser = user || defaultUser
const safeTrip = trip || defaultTrip
```

### Updating State

**Functional Updates Pattern** (Recommended):
```typescript
// Adding an item to trip
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
```

**Toggle Pattern**:
```typescript
// Toggling saved experience
setUser((current) => {
  const base = current || defaultUser
  const isSaved = base.saved.includes(experienceId)
  const updatedSaved = isSaved
    ? base.saved.filter((id) => id !== experienceId)
    : [...base.saved, experienceId]
  return { ...base, saved: updatedSaved }
})
```

---

## State Flows

### Onboarding Flow

```
User completes onboarding
         │
         ▼
setUser({
  ...user,
  preferences: selectedPreferences,
  hasCompletedOnboarding: true
})
         │
         ▼
setTrip({
  ...trip,
  startDate: selectedDates.start,
  endDate: selectedDates.end
})
```

### Add to Trip Flow

```
User clicks "Add to Trip"
         │
         ▼
Create TripItem from experience
         │
         ▼
setTrip((current) => {
  updatedItems = [...current.items, newItem]
  totals = calculateTripTotal(updatedItems)
  return { ...current, items: updatedItems, ...totals }
})
         │
         ▼
Toast notification shown
```

### Checkout Complete Flow

```
Payment confirmed
         │
         ▼
Create Booking object with trip snapshot
         │
         ▼
setBookings((current) => [...current, newBooking])
         │
         ▼
Reset trip to default (new planning trip)
setTrip({
  ...defaultTrip,
  id: `trip_${Date.now()}`
})
```

---

## Screen State (Local)

The current screen is managed via React's `useState`:

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

const [currentScreen, setCurrentScreen] = useState<Screen>({ type: 'onboarding' })
```

---

## Helper Functions

Located in `src/lib/helpers.ts`:

| Function | Purpose |
|----------|---------|
| `calculateTripTotal(items)` | Calculate subtotal, fee, total |
| `getExperienceById(id)` | Lookup experience from mock data |
| `getExperiencesByCategory(categoryId)` | Filter experiences |
| `filterExperiences(exps, filter)` | Apply filter type |
| `formatPrice(amount, currency)` | Format currency display |
| `formatDate(dateString)` | Format date display |
| `formatDateRange(start, end)` | Format date range |
| `generateBookingReference()` | Create booking ref |
| `generateDemoBookings()` | Create demo data |

---

## Development Considerations

### KV Storage Behavior

- **Development**: May return 403 without Spark authentication
- **Production**: Fully persistent when deployed to Spark
- **Fallback**: Application uses in-memory state with defaults

### Safe Patterns

Always use safe access:
```typescript
const safeBookings = bookings || []
const safeUser = user || defaultUser
```

Always use functional updates:
```typescript
// ✅ Correct
setTrip((current) => ({ ...current, ...updates }))

// ❌ Avoid (may cause stale state)
setTrip({ ...trip, ...updates })
```

---

*Generated by BMAD Document Project Workflow v1.2.0*
