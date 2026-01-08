# Pulau - Global Requirements Inventory

## Functional Requirements (FRs)

**FR1**: Visual itinerary builder where travelers add experiences that populate a calendar-style trip view with real-time pricing updates
**FR2**: Browse categorized local experiences with smart filtering by difficulty, duration, price, and type
**FR3**: Rich multimedia experience detail pages with image carousels, operator stories, reviews, and pricing calculator
**FR4**: Multi-step checkout flow with progress indication (Review → Traveler Details → Payment → Confirmation)
**FR5**: 3-screen onboarding flow capturing travel style, group type, budget, and optional trip dates
**FR6**: Booking history dashboard with upcoming/past trip tabs, status tracking, and "Book Again" functionality
**FR7**: Personalized "Perfect for you" recommendations based on onboarding preferences
**FR8**: Scheduling conflict detection with warning banners when activities overlap
**FR9**: Experience search functionality with instant results
**FR10**: Wishlist/saved experiences feature with persistent storage
**FR11**: Dynamic price calculation with real-time updates
**FR12**: Date management allowing browsing without dates set
**FR13**: Trip sharing functionality generating shareable links
**FR14**: Active trip mode transforming home screen during travel dates
**FR15**: Filter system with horizontally scrollable chips
**FR16**: Empty state designs with contextual CTAs
**FR17**: Form validation preventing incomplete checkout submissions
**FR18**: "Currently unavailable" badge for sold-out experiences with waitlist
**FR19**: Network interruption handling with cached trip data persistence
**FR20**: Review system with ratings, photos, and reviewer details
**FR21**: Operator profile display with verification badges
**FR22**: Meeting point information with embedded maps
**FR23**: Cancellation policy display in friendly language
**FR24**: "What's Included" and "Not Included" checklists
**FR25**: Trip view toggle between Calendar View and List View
**FR26**: Unscheduled items section for experiences added without dates
**FR27**: Explore/Discovery screen with curated sections
**FR28**: Profile management with photo, name, and member since date
**FR29**: Settings for payment, notifications, currency, language, etc.
**FR30**: Bottom tab navigation (Home, Explore, Quick Add, Saved, Profile)
**FR31**: Customer authentication (registration, login, password reset)
**FR32**: Customer profile with saved payments and preference management
**FR33**: Vendor authentication with separate portal
**FR34**: Vendor dashboard for experience and booking management
**FR35**: Vendor experience management (creation, editing, pricing, availability)
**FR36**: Real-time availability checking
**FR37**: Vendor-customer messaging
**FR38**: Multi-destination architecture supporting expansion beyond Bali

## Non-Functional Requirements (NFRs)

**NFR1**: Performance - Instant filter updates (<100ms), trip building completable in <10 min
**NFR2**: Offline resilience - Data persistence via Spark KV, graceful degradation
**NFR3**: Mobile-first responsive design - 44x44px touch targets, bottom-focused actions
**NFR4**: Accessibility - WCAG 2.1 AA compliance, screen reader support
**NFR5**: Animation performance - Physics-based transitions, 60fps, reduced-motion-support
**NFR6**: Design consistency - Bali-inspired palette, specific typography, 4px base unit
**NFR7**: Visual storytelling - High-quality imagery, golden hour lighting
**NFR8**: Trust building - Transparent pricing, operator verification badges
**NFR9**: State persistence - localStorage (~5MB), cross-session retention
**NFR10**: Error handling - Root error boundary, consistent UI patterns
**NFR11**: Form validation - Zod schemas, React Hook Form, inline validation
**NFR12**: Type safety - TypeScript strict mode, no `any` types, null safety
**NFR13**: Scalability - Destination-agnostic core architecture
**NFR14**: Security - Secure auth flows, session timeouts, HTTPS
**NFR15**: Payment processing - PCI compliance, token handling

## Architectural Requirements (ARCH)

**ARCH1**: GitHub Spark Platform - @github/spark SDK, useKV hook
**ARCH2**: Tech stack - React 19, TS 5.7.2, Vite 7.2.6, Tailwind 4.1.11, Radix UI, Framer Motion
**ARCH3**: Component architecture - shadcn/ui pattern, CVA for variants
**ARCH4**: State management - Spark useKV for persistent state, useState for UI state
**ARCH5**: Build tooling - Vite HMR, ESLint with TS/React rules
**ARCH6**: Path aliases - `@/*` → `./src/*`
**ARCH7**: Mobile-first Tailwind breakpoints - sm/md/lg
**ARCH8**: Animation library - Framer Motion with AnimatePresence
**ARCH9**: Toast notifications - Sonner library
**ARCH10**: Icon system - Phosphor icons (2px stroke)
**ARCH11**: Backend integration planning - Mock data architecture (no backend yet)
**ARCH12**: Testing infrastructure - Needs test architecture definition
**ARCH13**: Authentication architecture - Dual auth system (Customer/Vendor)
**ARCH14**: Database schema design - Relational schema needed
**ARCH15**: API design - RESTful or GraphQL API needed
