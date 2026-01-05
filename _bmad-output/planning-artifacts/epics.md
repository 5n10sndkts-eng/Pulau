---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ['prd/pulau-prd.md', 'architecture/architecture.md', 'pulau-detailed-spec.md', 'vendor-customer-auth-requirements.md', 'project-context.md']
workflowType: 'epics-and-stories'
project_name: 'Pulau'
user_name: 'Moe'
date: '2026-01-05'
status: 'complete'
---

# Pulau - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Pulau, decomposing the requirements from the PRD, Architecture, detailed specifications, and vendor/customer authentication requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**FR1**: Visual itinerary builder where travelers add experiences that populate a calendar-style trip view with real-time pricing updates

**FR2**: Browse categorized local experiences (Water Adventures, Land Explorations, Culture & Experiences, Food & Nightlife, Getting Around, Destinations & Stays) with smart filtering by difficulty, duration, price, and type

**FR3**: Rich multimedia experience detail pages with image carousels, operator stories, reviews, pricing calculator with guest count adjustment, and booking action

**FR4**: Multi-step checkout flow with progress indication (Review → Traveler Details → Payment → Confirmation) with form validation and session persistence

**FR5**: 3-screen onboarding flow capturing travel style preferences (Adventure/Relaxation/Culture/Mix), group type (Solo/Couple/Friends/Family), budget level (Budget/Mid-range/Luxury), and optional trip dates

**FR6**: Booking history dashboard with upcoming/past trip tabs, status tracking, booking reference access, and "Book Again" functionality to duplicate completed trips

**FR7**: Personalized "Perfect for you" recommendations based on onboarding preferences displayed prominently in category browsers

**FR8**: Scheduling conflict detection with yellow warning banners and smart suggestions when activities overlap

**FR9**: Experience search functionality with instant results across all categories

**FR10**: Wishlist/saved experiences feature with heart icon toggle, persistent storage, and quick "Add to Trip" action

**FR11**: Dynamic price calculation showing guest multiplication, subtotal, service fee, and total with real-time updates

**FR12**: Date management allowing browsing without dates set, with prompts before checkout

**FR13**: Trip sharing functionality generating shareable links to planned itineraries

**FR14**: Active trip mode transforming home screen during travel dates with countdown timers, today's schedule, and quick access to confirmations

**FR15**: Filter system with horizontally scrollable chips (Beginner Friendly, Half Day, Full Day, Private, Group, price ranges, Top Rated) with instant result updates

**FR16**: Empty state designs for no trip items, no search results, no saved experiences, and no filter matches with contextual CTAs

**FR17**: Form validation preventing checkout submission with incomplete data, highlighting missing fields, and saving progress

**FR18**: "Currently unavailable" badge for sold-out experiences with waitlist signup and similar alternatives suggestions

**FR19**: Network interruption handling with cached trip data persistence, "Last updated" timestamps, and retry buttons

**FR20**: Review system displaying ratings (1-5 stars), review count, rating breakdown bars, traveler photos, reviewer details (name, country, date), and helpful voting

**FR21**: Operator profile display showing circular photo, business name, tagline, bio, since year, badges (Local Business, Verified Partner), and response time

**FR22**: Meeting point information with embedded maps, address with copy functionality, and "Get Directions" link

**FR23**: Cancellation policy display in friendly language with clear refund terms

**FR24**: "What's Included" and "Not Included" checklists with checkmarks and X marks

**FR25**: Trip view toggle between Calendar View (monthly grid with activity dots) and List View (timeline with day sections)

**FR26**: Unscheduled items section for experiences added without dates, with "Assign to Day" functionality

**FR27**: Explore/Discovery screen with sections for Trending, Hidden Gems, Limited Availability, Destination Guides, and Stories from Travelers

**FR28**: Profile management with photo, name, member since date, and edit functionality

**FR29**: Settings for payment methods, notifications, currency, language, help & support, about, terms, and privacy

**FR30**: Bottom tab navigation with Home (Trip), Explore, Quick Add modal, Saved, and Profile

**FR31**: Customer authentication with account creation, login, password reset, and session management

**FR32**: Customer profile with saved payment methods, trip history access, preference management, and cross-device synchronization

**FR33**: Vendor authentication with separate vendor login portal

**FR34**: Vendor dashboard for managing experiences, viewing bookings, tracking revenue, responding to inquiries, and analytics

**FR35**: Vendor experience management allowing creation, editing, pricing updates, availability calendar, photo uploads, and description editing

**FR36**: Real-time availability checking across customer and vendor interfaces

**FR37**: Vendor-customer messaging for special requests and booking communications

**FR38**: Multi-destination architecture supporting expansion beyond Bali with destination-agnostic data structures

### Non-Functional Requirements

**NFR1**: Performance - Instant filter updates (<100ms), trip building workflow completable in <10 minutes, image lazy loading

**NFR2**: Offline resilience - Trip data persistence via Spark KV localStorage, graceful degradation without network, "Last updated" timestamps

**NFR3**: Mobile-first responsive design - 44x44px minimum touch targets, breakpoints at 640px/768px/1024px, one-handed operation, bottom 60% primary actions

**NFR4**: Accessibility - WCAG 2.1 AA color contrast ratios (verified in PRD), semantic HTML, Radix UI primitives, keyboard navigation, screen reader support

**NFR5**: Animation performance - Physics-based transitions (150-500ms), reduced-motion media query support, 60fps animations, smooth page transitions

**NFR6**: Design consistency - Bali-inspired color palette (Deep Teal #0D7377, Warm Coral #FF6B6B, Golden Sand #F4D03F), Plus Jakarta Sans for headlines, Inter for body, 12-16px border radius, consistent spacing system (4px base unit)

**NFR7**: Visual storytelling - High-quality imagery with golden hour lighting, real people photos, vibrant natural colors, progressive disclosure patterns

**NFR8**: Trust building - Transparent pricing with no hidden fees, prominent review display, operator verification badges, clear what's included/excluded lists

**NFR9**: State persistence - localStorage for trip data (~5MB limit), session persistence for incomplete bookings, cross-session preference retention

**NFR10**: Error handling - Error boundary at root, consistent error UI patterns, clear error messages, retry mechanisms

**NFR11**: Form validation - Zod schemas with React Hook Form, inline validation, helpful error messages, autosave for long forms

**NFR12**: Type safety - TypeScript strict mode, no `any` types, discriminated unions, null safety patterns

**NFR13**: Scalability - Destination-agnostic architecture supporting multi-destination expansion, configurable per destination (currency, timezone, language)

**NFR14**: Security - Secure authentication flows, encrypted password storage, session timeout, HTTPS enforcement for payment

**NFR15**: Payment processing - PCI compliance, support for credit/debit cards, PayPal, Apple Pay, Google Pay, secure token handling

### Additional Requirements from Architecture

**ARCH1**: GitHub Spark Platform - Must use @github/spark SDK, useKV hook for state persistence, Vite plugins (sparkPlugin, createIconImportProxy)

**ARCH2**: Tech stack established - React 19, TypeScript 5.7.2 strict mode, Vite 7.2.6, Tailwind CSS 4.1.11, Radix UI primitives, Framer Motion for animations

**ARCH3**: Component architecture - shadcn/ui pattern, single component per file, co-located props interfaces, class-variance-authority for variants

**ARCH4**: State management - Spark useKV for persistent state, React useState for local UI state, discriminated unions for screen routing

**ARCH5**: Build tooling - Hot Module Replacement via Vite, ESLint with TypeScript and React Hooks rules, optimized production builds with code splitting

**ARCH6**: Path aliases configured - `@/*` → `./src/*` for clean imports

**ARCH7**: Mobile-first Tailwind breakpoints - sm (640px), md (768px), lg (1024px)

**ARCH8**: Animation library - Framer Motion with AnimatePresence for enter/exit animations, physics-based spring animations

**ARCH9**: Toast notifications - Sonner library for "Added to trip", "Saved to wishlist", success/error messages

**ARCH10**: Icon system - Phosphor icons with rounded style, 2px stroke weight, custom category icons

**ARCH11**: Backend integration planning - Mock data architecture ready for API integration, no backend currently exists

**ARCH12**: Testing infrastructure gap - No testing currently, needs test architecture definition

**ARCH13**: Authentication architecture - Needs dual authentication system (customer + vendor portals)

**ARCH14**: Database schema design - Needs relational schema for experiences, bookings, users, vendors, reviews

**ARCH15**: API design - RESTful or GraphQL API needed for experience CRUD, booking management, authentication, search

### Additional Requirements from Detailed Spec

**DETAIL1**: 11 distinct screen types - Onboarding (3 screens), Home/Trip Canvas, Category Browser, Experience Detail, Trip Builder, Checkout (4 steps), Active Trip Mode, Explore, Saved/Wishlist, Profile

**DETAIL2**: Micro-interactions - Item "flies" to trip bar on add (150ms ease-out), heart "pops" on save (200ms bounce), confetti on booking confirmation (500ms), parallax image carousels

**DETAIL3**: Typography hierarchy - Large Title 28-32px, Title 22-24px, Headline 18-20px, Body 16px, Caption 14px, Small 12px

**DETAIL4**: Spacing system - Card padding 16-20px, screen margins 16-20px horizontal/24px vertical, section spacing 24-32px, base unit 4px

**DETAIL5**: Component variants - Button (primary teal filled, secondary coral outline, ghost text), Card (default flat, hover elevated, selected bordered), Input (default, focus ring, error, success)

**DETAIL6**: Loading states - Skeleton screens matching card dimensions, spinner for checkout, progress bars for images

**DETAIL7**: Empty states - Empty trip (suitcase illustration + "Start Exploring" CTA), No results (friendly illustration + clear filters), Empty wishlist (heart + browse CTA)

**DETAIL8**: Error states - Network error (retry button), Booking failed (contact support), Payment failed (retry with specific error)

**DETAIL9**: Success states - Added to trip (toast), Booking confirmed (full-screen animation), Saved (heart animation + toast)

**DETAIL10**: Data structures defined - Destinations, Categories, Experiences (with provider, pricing, images, reviews), Trips, User profiles with detailed mock data examples

**DETAIL11**: Touch targets - Minimum 44x44px for all interactive elements, increased tap padding on mobile

**DETAIL12**: Bottom tab bar - Fixed 64px height with safe area inset on mobile

**DETAIL13**: Progressive disclosure - Details expand on demand, never overwhelming users, minimal text where images communicate

**DETAIL14**: Flexible trip building - Add/remove/reschedule freely until booking, no confirmation dialogs for non-destructive actions

**DETAIL15**: Pull-to-refresh - Custom wave/tropical themed loader

### Additional Requirements from Vendor/Customer Auth

**VEND1**: Vendor account creation and login system separate from customer portal

**VEND2**: Vendor experience creation interface with fields for title, description, category, pricing, duration, group size, difficulty, languages, images

**VEND3**: Vendor experience editing capabilities for all experience attributes

**VEND4**: Vendor availability calendar management to control bookable dates

**VEND5**: Vendor booking dashboard showing incoming reservations with customer details

**VEND6**: Vendor revenue tracking and analytics (views, bookings, conversion rate)

**VEND7**: Vendor-customer messaging system for special requests

**VEND8**: Customer account creation and login system

**VEND9**: Customer trip plan synchronization across devices

**VEND10**: Customer saved payment methods with secure storage

**VEND11**: Customer booking history accessible across sessions

**VEND12**: Two-sided marketplace architecture supporting both vendor and customer workflows

### FR Coverage Map

FR1 → Epic 8 (Trip Canvas Building)
FR2 → Epic 6 (Experience Discovery)
FR3 → Epic 6 (Experience Detail Pages)
FR4 → Epic 10 (Multi-Step Checkout)
FR5 → Epic 4 (Onboarding)
FR6 → Epic 11 (Booking History)
FR7 → Epic 4 (Personalization)
FR8 → Epic 9 (Conflict Detection)
FR9 → Epic 6 (Search)
FR10 → Epic 7 (Wishlist)
FR11 → Epic 8 (Price Calculation)
FR12 → Epic 8 (Date Management)
FR13 → Epic 9 (Trip Sharing)
FR14 → Epic 11 (Active Trip Mode)
FR15 → Epic 6 (Filtering)
FR16 → Epic 17 (Empty States)
FR17 → Epic 10 (Form Validation)
FR18 → Epic 17 (Sold Out Handling)
FR19 → Epic 17 (Network Interruption)
FR20 → Epic 6 (Reviews)
FR21 → Epic 6 (Operator Profiles)
FR22 → Epic 6 (Meeting Points)
FR23 → Epic 6 (Cancellation Policy)
FR24 → Epic 6 (Inclusions)
FR25 → Epic 8 (View Toggle)
FR26 → Epic 8 (Unscheduled Items)
FR27 → Epic 12 (Explore Screen)
FR28 → Epic 13 (Profile Management)
FR29 → Epic 13 (Settings)
FR30 → Epic 18 (Bottom Navigation)
FR31 → Epic 2 (Customer Auth)
FR32 → Epic 2 (Customer Profile)
FR33 → Epic 3 (Vendor Auth)
FR34 → Epic 5 (Vendor Dashboard)
FR35 → Epic 5 (Vendor Experience Management)
FR36 → Epic 15 (Real-time Availability)
FR37 → Epic 15 (Messaging)
FR38 → Epic 19 (Multi-Destination)

NFR1 → Epic 8 (Performance)
NFR2 → Epic 8 (Offline Resilience)
NFR3 → Epic 16 (Mobile-First)
NFR4 → Epic 16 (Accessibility)
NFR5 → Epic 16 (Animation)
NFR6-NFR8 → Epic 16 (Design Consistency & Visual Storytelling)
NFR9 → Epic 2, 8 (State Persistence)
NFR10 → Epic 17 (Error Handling)
NFR11 → Epic 10 (Form Validation)
NFR12 → Epic 1 (Type Safety)
NFR13 → Epic 19 (Scalability)
NFR14 → Epic 2, 3 (Security)
NFR15 → Epic 10 (Payment Processing)

ARCH1-15 → Epic 1 (Foundation & Technical Infrastructure)
DETAIL1-15 → Epics 6, 8, 16, 17 (UX Details across features)
VEND1-12 → Epics 3, 5, 14, 15 (Vendor Portal Features)

## Epic List

### Epic 1: Foundation & Technical Infrastructure
Development environment established with GitHub Spark, React 19, TypeScript strict mode, Tailwind CSS, component architecture, build tooling, and all technical foundations for rapid feature development.
**FRs covered:** ARCH1-ARCH15, NFR12

### Epic 2: User Authentication & Profile Management
Customers create accounts, login securely, manage profiles with saved payment methods, and access personalized features with cross-device synchronization.
**FRs covered:** FR31, FR32, VEND8, VEND9, VEND10, VEND11, NFR14, NFR9

### Epic 3: Vendor Portal & Authentication
Local operators (vendors) register, login securely, and access their dedicated management portal separate from customer portal.
**FRs covered:** FR33, VEND1, VEND12, NFR14

### Epic 4: Onboarding & Personalization
New users complete 3-screen guided onboarding flow, set travel preferences (style/group/budget), optionally add dates, and receive personalized "Perfect for you" recommendations.
**FRs covered:** FR5, FR7, NFR9

### Epic 5: Experience Data Model & Vendor Management
Vendors create, edit, and manage experiences (tours/activities) with pricing, photos, descriptions, availability calendars, and detailed information. System provides vendor dashboard for analytics and performance tracking.
**FRs covered:** FR34, FR35, VEND2, VEND3, VEND4, VEND6, ARCH14, DETAIL10

### Epic 6: Experience Discovery & Browse
Travelers browse categorized experiences (6 categories), filter by preferences (difficulty/duration/price), search across all experiences, view rich detail pages with image carousels, operator profiles, reviews, meeting points, and inclusions.
**FRs covered:** FR2, FR3, FR9, FR15, FR20, FR21, FR22, FR23, FR24, NFR6, NFR7, NFR8, DETAIL1

### Epic 7: Wishlist & Saved Experiences
Users save favorite experiences to wishlist with heart icon toggle, view all saved items, and quickly add saved experiences to active trip plans.
**FRs covered:** FR10, DETAIL9

### Epic 8: Trip Canvas & Itinerary Building
Travelers visually build custom trip itineraries by adding experiences with calendar/list view toggle, real-time pricing calculation, date management, unscheduled items section, and offline persistence.
**FRs covered:** FR1, FR11, FR12, FR25, FR26, NFR1, NFR2, NFR9, DETAIL2, DETAIL14

### Epic 9: Scheduling & Conflict Detection
System automatically detects when activities overlap in time, displays yellow warning banners with smart suggestions, and provides trip sharing via shareable links.
**FRs covered:** FR8, FR13

### Epic 10: Multi-Step Checkout & Booking
Travelers complete secure bookings through guided 4-step checkout (Review → Traveler Details → Payment → Confirmation) with form validation, session persistence, payment processing (cards/PayPal/Apple Pay/Google Pay), and success animations.
**FRs covered:** FR4, FR17, NFR11, NFR15, DETAIL8, DETAIL9

### Epic 11: Booking Management & History
Users view booking history with upcoming/past tabs, manage active trips, access booking confirmations and references, utilize "Book Again" to duplicate past trips, and experience active trip mode during travel dates with countdown timers.
**FRs covered:** FR6, FR14, VEND5, VEND7, FR37

### Epic 12: Explore & Discovery Features
Users discover content through Explore screen with curated sections: Trending in Bali, Hidden Gems, Limited Availability alerts, Destination Guides, and Stories from Travelers.
**FRs covered:** FR27, DETAIL1

### Epic 13: Profile & Settings Management
Users manage comprehensive profile (photo, name, member since), payment methods, notification preferences, currency selection, language settings, and access help, about, terms, and privacy pages.
**FRs covered:** FR28, FR29

### Epic 14: Vendor Analytics & Revenue Tracking
Vendors track business performance with analytics dashboard showing booking metrics, revenue tracking, view counts, conversion rates, and customer engagement data.
**FRs covered:** VEND6

### Epic 15: Real-time Availability & Messaging
Customers see real-time experience availability, vendors update availability calendars instantly, and both parties communicate via messaging system for special requests and booking coordination.
**FRs covered:** FR36, FR37, VEND7

### Epic 16: Mobile-First Responsive Design
All features work seamlessly across mobile (44x44px touch targets), tablet, and desktop with responsive breakpoints, one-handed operation, physics-based animations (150-500ms), Bali-inspired design system, typography hierarchy, spacing system, and accessibility compliance (WCAG 2.1 AA).
**FRs covered:** NFR3, NFR4, NFR5, NFR6, NFR7, NFR8, ARCH7, ARCH8, DETAIL3-DETAIL7, DETAIL11-DETAIL13

### Epic 17: Edge Cases & Error Handling
Users experience graceful handling of edge cases: empty states for no results/trips/saved items, network interruption with offline persistence, sold-out experience badges with waitlist, error boundaries with retry mechanisms, and consistent error messaging.
**FRs covered:** FR16, FR18, FR19, NFR10, DETAIL6-DETAIL8

### Epic 18: Bottom Navigation & Screen Architecture
Users navigate seamlessly between 5 primary sections via persistent bottom tab bar (64px height with safe area inset): Home/Trip, Explore, Quick Add modal, Saved/Wishlist, and Profile.
**FRs covered:** FR30, DETAIL1, DETAIL12

### Epic 19: Multi-Destination Scalability
Platform supports multiple destinations beyond Bali with destination-agnostic architecture, configurable per-destination settings (currency, timezone, language), and extensible data structures for global expansion.
**FRs covered:** FR38, NFR13


## Epic 1: Foundation & Technical Infrastructure

**Goal:** Development environment established with GitHub Spark, React 19, TypeScript strict mode, Tailwind CSS, component architecture, build tooling, and all technical foundations for rapid feature development.

### Story 1.1: Initialize GitHub Spark Project with TypeScript

As a developer,
I want the GitHub Spark project initialized with TypeScript strict mode and all build tools configured,
So that we have a solid foundation for type-safe development.

**Acceptance Criteria:**

**Given** a new project repository
**When** the GitHub Spark template is initialized
**Then** the project includes @github/spark SDK, useKV hook, Vite 7.2.6, and TypeScript 5.7.2 with strict mode enabled
**And** path aliases `@/*` → `./src/*` are configured in tsconfig.json
**And** ESLint with TypeScript and React Hooks rules is configured
**And** npm install completes without errors
**And** npm run dev starts the development server successfully

### Story 1.2: Configure Tailwind CSS Design System

As a developer,
I want Tailwind CSS 4.1.11 configured with the Bali-inspired design tokens,
So that all UI components follow the consistent design system.

**Acceptance Criteria:**

**Given** the initialized project from Story 1.1
**When** Tailwind CSS is configured with Vite plugin
**Then** tailwind.config.js includes custom color palette (Deep Teal #0D7377, Warm Coral #FF6B6B, Golden Sand #F4D03F, Success #27AE60)
**And** custom fonts are configured (Plus Jakarta Sans, Inter)
**And** mobile-first breakpoints are set (sm: 640px, md: 768px, lg: 1024px)
**And** spacing system with 4px base unit is configured
**And** border radius tokens (12-16px cards, 8px buttons, 24px pills) are defined
**And** a test component renders with Tailwind classes successfully

### Story 1.3: Set Up Component Architecture with Radix UI

As a developer,
I want Radix UI primitives and shadcn/ui pattern established,
So that we can build accessible, reusable components quickly.

**Acceptance Criteria:**

**Given** Tailwind CSS is configured from Story 1.2
**When** Radix UI primitives are installed and configured
**Then** shadcn/ui CLI is set up with components path at `src/components/ui`
**And** class-variance-authority is installed for component variants
**And** sample Button component exists with three variants (primary teal filled, secondary coral outline, ghost text)
**And** sample Card component exists with hover states (default flat, hover elevated)
**And** components export TypeScript interfaces for props
**And** all components render without console errors

### Story 1.4: Configure Animation Library and Icon System

As a developer,
I want Framer Motion and Phosphor icons configured,
So that we can implement smooth animations and consistent iconography.

**Acceptance Criteria:**

**Given** component architecture is established from Story 1.3
**When** Framer Motion and Phosphor icons are installed
**Then** Framer Motion AnimatePresence wrapper is available for route transitions
**And** Phosphor icons library is imported with rounded style and 2px stroke
**And** Sonner toast library is configured for notifications
**And** sample animation (button click with scale) works smoothly at 60fps
**And** sample icons render (House, Compass, Heart, User)
**And** reduced-motion media query support is implemented

### Story 1.5: Establish TypeScript Type Safety Patterns

As a developer,
I want TypeScript strict mode patterns and discriminated unions documented,
So that the codebase maintains type safety throughout development.

**Acceptance Criteria:**

**Given** all previous configuration stories are complete
**When** TypeScript strict mode is enforced
**Then** tsconfig.json has `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`
**And** example discriminated union for screen routing is documented (e.g., Screen type with kind property)
**And** example Record type for key-value mappings is documented
**And** null safety patterns are documented (optional chaining, nullish coalescing)
**And** no `any` types are used in example code
**And** TypeScript compiler shows zero errors on npm run type-check

---

## Epic 2: User Authentication & Profile Management

**Goal:** Customers create accounts, login securely, manage profiles with saved payment methods, and access personalized features with cross-device synchronization.

### Story 2.1: Implement Customer Registration Flow

As a traveler,
I want to create an account with email and password,
So that I can save my trips and preferences.

**Acceptance Criteria:**

**Given** I am on the registration screen
**When** I enter valid email, password (min 8 chars), and confirm password
**Then** a new user account is created in the database (users table)
**And** password is hashed using bcrypt before storage
**And** user receives a verification email
**And** user record includes: id (UUID), email, hashed_password, created_at, email_verified (boolean)
**And** I am redirected to the onboarding flow
**And** validation shows errors for: invalid email format, password too short, passwords don't match

### Story 2.2: Implement Customer Login with Session Management

As a registered traveler,
I want to login with my email and password,
So that I can access my saved trips and profile.

**Acceptance Criteria:**

**Given** I have a registered account from Story 2.1
**When** I enter correct email and password on login screen
**Then** my credentials are verified against hashed password in database
**And** a secure session token (JWT) is generated with 7-day expiration
**And** session token is stored in localStorage and HTTP-only cookie
**And** I am redirected to the home screen with authenticated state
**And** error message displays for incorrect email or password
**And** session automatically refreshes before expiration
**And** session expires and redirects to login after 7 days of inactivity

### Story 2.3: Implement Password Reset Flow

As a traveler who forgot my password,
I want to reset my password via email,
So that I can regain access to my account.

**Acceptance Criteria:**

**Given** I am on the "Forgot Password" screen
**When** I enter my registered email address
**Then** a password reset token (UUID) is generated and stored with 1-hour expiration
**And** a reset email is sent with a secure link containing the token
**When** I click the reset link and enter a new password (min 8 chars)
**Then** the token is validated (not expired, matches user)
**And** my password is updated with new hashed value
**And** all existing sessions are invalidated
**And** I receive confirmation and am redirected to login
**And** error shows for expired or invalid tokens

### Story 2.4: Create User Profile Management Interface

As a logged-in traveler,
I want to view and edit my profile information,
So that my account details are up to date.

**Acceptance Criteria:**

**Given** I am logged in and navigate to Profile screen
**When** the profile screen loads
**Then** I see my current profile: first name, last name, email, profile photo, member since date
**When** I tap "Edit Profile"
**Then** I can update: first name, last name, phone number, nationality
**And** I can upload a new profile photo (max 5MB, JPG/PNG)
**And** photo is resized to 400x400px and stored in cloud storage
**And** changes are saved to user_profiles table (user_id, first_name, last_name, phone, nationality, photo_url)
**And** success toast displays "Profile updated"
**And** validation prevents saving empty first/last name

### Story 2.5: Implement Saved Payment Methods

As a frequent traveler,
I want to save my payment methods securely,
So that checkout is faster on future bookings.

**Acceptance Criteria:**

**Given** I am logged in and on the Payment Methods settings screen
**When** I add a new payment method (credit card)
**Then** card details are tokenized via payment gateway (Stripe/PayPal) without storing raw card numbers
**And** only last 4 digits and card brand (Visa/Mastercard) are stored in payment_methods table
**And** payment_methods table includes: user_id, payment_token, last_four, card_brand, expiry_month, expiry_year, is_default
**When** I set a card as default
**Then** is_default flag updates, and only one card can be default
**When** I delete a payment method
**Then** the record is soft-deleted (deleted_at timestamp)
**And** I can add multiple payment methods
**And** PCI compliance is maintained (no raw card data stored)

### Story 2.6: Enable Cross-Device Profile Sync with Spark KV

As a traveler using multiple devices,
I want my profile and preferences synced automatically,
So that I have a consistent experience across devices.

**Acceptance Criteria:**

**Given** I am logged in on Device A
**When** I update my profile or preferences
**Then** changes are persisted to Spark useKV localStorage
**And** changes are also synced to backend user_profiles table
**When** I login on Device B with the same account
**Then** my profile data is loaded from backend on initial login
**And** subsequent changes on Device B sync via useKV and backend
**And** last_synced_at timestamp tracks sync state
**And** conflicts are resolved using "last write wins" strategy
**And** sync works offline (queues updates until network returns)

---

## Epic 3: Vendor Portal & Authentication

**Goal:** Local operators (vendors) register, login securely, and access their dedicated management portal separate from customer portal.

### Story 3.1: Create Vendor Registration Flow

As a local tour operator,
I want to register as a vendor on the platform,
So that I can list my experiences for travelers to book.

**Acceptance Criteria:**

**Given** I am on the vendor registration page (separate route from customer)
**When** I submit the vendor registration form
**Then** a new vendor account is created in vendors table
**And** vendors table includes: id (UUID), business_name, business_email, hashed_password, owner_first_name, owner_last_name, phone, created_at, verified (boolean), since_year
**And** business email is validated for uniqueness
**And** password meets security requirements (min 8 chars, hashed with bcrypt)
**And** vendor status is set to "pending_verification"
**And** verification email is sent to business_email
**And** admin notification is sent for manual vendor approval
**And** I see "Registration received - awaiting approval" message

### Story 3.2: Implement Vendor Login and Portal Access

As a registered vendor,
I want to login to my vendor portal,
So that I can manage my experiences and bookings.

**Acceptance Criteria:**

**Given** my vendor account is verified from Story 3.1
**When** I navigate to /vendor/login and enter correct credentials
**Then** my credentials are authenticated against vendors table
**And** a vendor JWT session token is generated (separate from customer tokens)
**And** token includes vendor_id and role: "vendor"
**When** authentication succeeds
**Then** I am redirected to /vendor/dashboard
**And** vendor navigation shows different menu than customer portal (Dashboard, My Experiences, Bookings, Analytics, Settings)
**And** vendor session expires after 12 hours of inactivity
**And** error displays for unverified vendors: "Your account is pending verification"

### Story 3.3: Build Vendor Dashboard Landing Page

As a logged-in vendor,
I want to see an overview dashboard,
So that I can quickly understand my business performance.

**Acceptance Criteria:**

**Given** I am logged in as a vendor
**When** I access /vendor/dashboard
**Then** dashboard displays summary cards:
  - Total Experiences Listed (count)
  - Total Bookings This Month (count)
  - Revenue This Month (sum of booking amounts)
  - Average Rating (avg of all reviews)
**And** dashboard shows "Recent Bookings" list (latest 5 with: traveler name, experience name, date, status)
**And** dashboard shows "Quick Actions" buttons: "+ Add New Experience", "View All Bookings", "Manage Calendar"
**And** all data queries filter by vendor_id of logged-in vendor
**And** empty state shows when no experiences exist yet: "List your first experience to get started"

---

## Epic 4: Onboarding & Personalization

**Goal:** New users complete 3-screen guided onboarding flow, set travel preferences (style/group/budget), optionally add dates, and receive personalized "Perfect for you" recommendations.

### Story 4.1: Create Onboarding Welcome Screen

As a new user opening the app,
I want to see a welcoming first impression,
So that I understand what the app offers.

**Acceptance Criteria:**

**Given** I am a first-time user who just registered
**When** the onboarding flow starts
**Then** Screen 1 displays a full-screen Bali hero image with subtle parallax
**And** app logo "Pulau" is overlaid on image
**And** tagline "Build Your Bali Dream" displays below logo
**And** primary button "Get Started" is prominently displayed (teal background, white text)
**When** I tap "Get Started"
**Then** I proceed to Screen 2 (Preference Selector)
**And** progress indicator shows "1 of 3" at top
**And** image loads with skeleton while fetching

### Story 4.2: Build Travel Preference Selection Screen

As a new user going through onboarding,
I want to select my travel preferences,
So that I receive personalized experience recommendations.

**Acceptance Criteria:**

**Given** I am on onboarding Screen 2
**When** the screen loads
**Then** I see three preference sections with tappable cards:
  - Travel Style: Adventure, Relaxation, Culture, Mix of Everything
  - Group Type: Solo, Couple, Friends, Family
  - Budget Feel: Budget-Conscious, Mid-Range, Luxury
**When** I tap a preference card
**Then** the card highlights with teal border and checkmark icon
**And** multiple selections are allowed within each section
**And** at least one selection per section is required before continuing
**When** I tap "Continue" with valid selections
**Then** preferences are saved to user_preferences table (user_id, travel_style[], group_type, budget_level, created_at)
**And** I proceed to Screen 3 (Trip Dates)
**And** progress indicator shows "2 of 3"

### Story 4.3: Add Optional Trip Dates Screen

As a user completing onboarding,
I want to optionally set my trip dates,
So that the app can filter experiences by availability.

**Acceptance Criteria:**

**Given** I am on onboarding Screen 3
**When** the screen loads
**Then** I see two date pickers: "Arrival Date" and "Departure Date"
**And** date pickers default to empty (no dates selected)
**And** I see "Skip for now - Just browsing" link at bottom
**When** I select an arrival date
**Then** departure date picker minimum is set to arrival date + 1 day
**When** I select valid dates
**Then** dates are saved to user_preferences table (trip_start_date, trip_end_date)
**When** I tap "Continue" OR "Skip for now"
**Then** onboarding flow completes
**And** user is redirected to Home screen (/home)
**And** onboarding_completed flag is set to true in user record
**And** if skipped, trip_start_date and trip_end_date remain null

### Story 4.4: Implement Personalized Recommendations Engine

As a user who completed onboarding,
I want to see "Perfect for you" experiences,
So that I discover relevant activities quickly.

**Acceptance Criteria:**

**Given** I completed onboarding with preferences saved
**When** I browse any experience category
**Then** experiences are scored based on my preferences:
  - +10 points if experience.difficulty matches my travel_style (Adventure → Moderate/Challenging, Relaxation → Easy, Culture → Easy/Moderate)
  - +15 points if experience.tags overlap with travel_style
  - +5 points if experience.price_per_person fits my budget_level
  - +5 points if experience.group_size max >= my group_type typical size
**And** top 3 highest-scoring experiences in category display "Perfect for you" banner
**And** "Perfect for you" badge has warm coral background with star icon
**And** these experiences appear at top of category list
**And** recommendation algorithm logs scores to recommendations_log table for future ML improvements

---

## Epic 5: Experience Data Model & Vendor Management

**Goal:** Vendors create, edit, and manage experiences with pricing, photos, descriptions, availability calendars, and detailed information. System provides vendor dashboard for analytics and performance tracking.

### Story 5.1: Design and Create Experiences Database Schema

As a developer,
I want a comprehensive experiences database schema,
So that all experience data is properly structured and queryable.

**Acceptance Criteria:**

**Given** the vendor authentication system is in place
**When** the experiences schema is created
**Then** experiences table exists with columns:
  - id (UUID, primary key)
  - vendor_id (UUID, foreign key to vendors)
  - title (string, max 200 chars)
  - category (enum: water_adventures, land_explorations, culture_experiences, food_nightlife, transportation, stays)
  - subcategory (string)
  - destination_id (UUID, foreign key to destinations)
  - description (text)
  - price_amount (decimal)
  - price_currency (string, default USD)
  - price_per (enum: person, vehicle, group)
  - duration_hours (decimal)
  - start_time (time)
  - group_size_min (integer)
  - group_size_max (integer)
  - difficulty (enum: Easy, Moderate, Challenging)
  - languages (array of strings)
  - status (enum: draft, active, inactive, sold_out)
  - created_at, updated_at
**And** related tables are created:
  - experience_images (id, experience_id, image_url, display_order, created_at)
  - experience_inclusions (id, experience_id, item_text, is_included boolean, created_at)
  - experience_availability (id, experience_id, date, slots_available, status)
**And** indexes are created on: vendor_id, category, destination_id, status

### Story 5.2: Build Vendor Experience Creation Form

As a vendor,
I want to create a new experience listing,
So that travelers can discover and book my offering.

**Acceptance Criteria:**

**Given** I am logged in to the vendor portal
**When** I navigate to "Add New Experience"
**Then** I see a multi-step creation form with sections:
  - Basic Info: Title, Category dropdown, Subcategory, Description textarea
  - Pricing: Price amount, Currency, Per (person/vehicle/group)
  - Details: Duration (hours), Start time, Group size (min/max), Difficulty dropdown, Languages multi-select
  - Location: Meeting point address, Latitude, Longitude (map picker)
  - What's Included: Add multiple inclusions (checkmark items), Add multiple exclusions (X mark items)
**When** I fill all required fields and submit
**Then** a new record is created in experiences table with status = "draft"
**And** vendor_id is set to my logged-in vendor ID
**And** created_at timestamp is set
**And** I see success message "Experience created as draft"
**And** I am redirected to image upload step
**And** validation prevents submission with: empty title, invalid price, min > max group size

### Story 5.3: Implement Experience Image Upload

As a vendor,
I want to upload multiple photos for my experience,
So that travelers can see what I offer visually.

**Acceptance Criteria:**

**Given** I just created an experience (draft status) from Story 5.2
**When** I am on the image upload screen
**Then** I can upload 4-6 images via file picker or drag-and-drop
**And** accepted formats are JPG, PNG, WebP (max 10MB each)
**And** images are automatically resized to max 1920x1080 maintaining aspect ratio
**And** images are uploaded to cloud storage (S3/CDN)
**When** upload completes for each image
**Then** a record is created in experience_images table (experience_id, image_url, display_order)
**And** display_order is set based on upload sequence
**When** I reorder images via drag-and-drop
**Then** display_order values update in database
**And** at least 3 images are required before publishing experience
**And** upload progress indicator shows for each image
**And** failed uploads show retry button

### Story 5.4: Add Experience Editing Capabilities

As a vendor,
I want to edit my existing experiences,
So that I can keep information accurate and up-to-date.

**Acceptance Criteria:**

**Given** I have created experiences from previous stories
**When** I navigate to "My Experiences" list
**Then** I see all my experiences with: thumbnail, title, category, price, status
**When** I click "Edit" on an experience
**Then** the creation form opens pre-filled with existing data
**When** I modify any field and save
**Then** the experiences table record is updated with new values
**And** updated_at timestamp is set to current time
**And** change history is logged to experience_audit_log table (experience_id, vendor_id, changed_fields, old_values, new_values, changed_at)
**And** if experience status was "active", it remains active after edit
**And** I see success toast "Experience updated"
**And** changes reflect immediately in customer-facing views

### Story 5.5: Build Availability Calendar Management

As a vendor,
I want to manage which dates my experience is available,
So that travelers can only book when I'm operating.

**Acceptance Criteria:**

**Given** I am editing an experience
**When** I navigate to "Manage Availability" tab
**Then** I see a calendar UI for the next 12 months
**And** each date shows: Available (green), Limited Spots (yellow), Sold Out (red), Blocked (gray)
**When** I click a date
**Then** I can set: Status (Available/Blocked), Slots Available (number)
**And** changes save to experience_availability table (experience_id, date, slots_available, status)
**When** I select "Set Recurring Availability"
**Then** I can define: Days of week operating (checkboxes), Slots per day (number), Date range
**And** bulk records are created for matching dates
**And** blackout dates can be added to block specific days
**And** availability updates sync to customer views in real-time

### Story 5.6: Implement Experience Publishing Workflow

As a vendor,
I want to publish my draft experience to make it live,
So that travelers can discover and book it.

**Acceptance Criteria:**

**Given** I have a draft experience with all required fields completed
**When** I click "Publish Experience"
**Then** system validates:
  - Title, description, price, duration, group size are filled
  - At least 3 images are uploaded
  - At least one availability date is set
  - Meeting point information is complete
**When** validation passes
**Then** experience status changes from "draft" to "active"
**And** experience becomes visible in customer search and browse
**And** published_at timestamp is set
**And** I see confirmation "Experience is now live!"
**When** validation fails
**Then** specific missing items are highlighted
**And** error message lists requirements: "Complete these before publishing: [list]"

---

## Epic 6: Experience Discovery & Browse

**Goal:** Travelers browse categorized experiences (6 categories), filter by preferences, search, view rich detail pages with image carousels, operator profiles, reviews, meeting points, and inclusions.

### Story 6.1: Create Home Screen with Category Grid

As a traveler,
I want to see experience categories on the home screen,
So that I can browse activities that interest me.

**Acceptance Criteria:**

**Given** I am logged in and on the home screen
**When** the screen loads
**Then** I see 6 category cards in a 2x3 grid (single column on mobile <640px):
  - Water Adventures (icon: Waves, background: ocean image)
  - Land Explorations (icon: Bicycle, background: rice terrace image)
  - Culture & Experiences (icon: Buildings, background: temple image)
  - Food & Nightlife (icon: ForkKnife, background: food image)
  - Getting Around (icon: Van, background: scooter image)
  - Destinations & Stays (icon: Bed, background: villa image)
**And** each card has icon, background image with gradient overlay, category name, and tagline
**When** I tap a category card
**Then** I navigate to the category browse screen for that category
**And** smooth slide transition animation plays (300ms ease-in-out)
**And** categories load from categories table (id, name, slug, icon, tagline, background_image_url)

### Story 6.2: Build Category Browse Screen with Experience List

As a traveler,
I want to browse all experiences in a category,
So that I can see what's available.

**Acceptance Criteria:**

**Given** I tapped a category from Story 6.1
**When** the category browse screen loads
**Then** header shows: back arrow, category title (e.g., "Water Adventures"), search icon
**And** experiences load from experiences table filtered by category and status = "active"
**And** each experience card displays:
  - Hero image (16:9 ratio, rounded corners 12px)
  - Provider badge overlay (vendor business_name)
  - Experience title below image
  - Quick stats: Duration icon + hours, Group size icon + max people, Star icon + rating (avg)
  - Price: "From $XX / person" (formatted with currency)
  - Two buttons: "+ Quick Add" (primary teal), "See Details" (text link)
**And** cards are in vertical scrolling list
**And** list shows skeleton loading state while fetching
**And** infinite scroll loads more experiences as I scroll down (20 per page)

### Story 6.3: Implement Horizontal Filter Chips

As a traveler browsing a category,
I want to filter experiences by my preferences,
So that I find relevant options quickly.

**Acceptance Criteria:**

**Given** I am on a category browse screen from Story 6.2
**When** the screen loads
**Then** I see horizontally scrollable filter chips above the experience list:
  - [All] [Beginner Friendly] [Half Day] [Full Day] [Private] [Group] [Under $50] [Under $100] [Top Rated]
**When** I tap a filter chip
**Then** chip highlights with teal background and white text
**And** experience list updates instantly (<100ms) to show only matching experiences
**And** filtering logic:
  - "Beginner Friendly" → difficulty = "Easy"
  - "Half Day" → duration_hours <= 4
  - "Full Day" → duration_hours >= 6
  - "Private" → group_size_max <= 4
  - "Under $50" → price_amount < 50
  - "Top Rated" → avg rating >= 4.5
**And** multiple filters combine with AND logic
**When** I tap an active chip again
**Then** filter is removed and list refreshes
**And** "All" chip clears all filters

### Story 6.4: Add Experience Search Functionality

As a traveler,
I want to search for experiences by keyword,
So that I can quickly find specific activities.

**Acceptance Criteria:**

**Given** I am on any category browse screen
**When** I tap the search icon in header
**Then** a search input field expands below header
**When** I type a search query (e.g., "snorkeling", "temple", "cooking")
**Then** experiences are filtered in real-time as I type (debounced 300ms)
**And** search matches against: experience title, description, subcategory, vendor business_name, tags
**And** results display with search terms highlighted
**When** no results match
**Then** empty state shows: friendly illustration, "No experiences match 'query'", "Try different keywords or [Browse All]"
**When** I clear search or tap back
**Then** full experience list returns
**And** search queries log to search_log table (user_id, query, results_count, searched_at) for analytics

### Story 6.5: Create Detailed Experience Page

As a traveler,
I want to view comprehensive information about an experience,
So that I can make an informed booking decision.

**Acceptance Criteria:**

**Given** I tapped "See Details" or an experience card from browse
**When** the experience detail page loads
**Then** I see a full-width image carousel (swipeable, 4-6 images from experience_images ordered by display_order)
**And** carousel has dot indicators at bottom
**And** floating back button (top left, semi-transparent) and heart/save button (top right)
**And** Quick Info Bar displays icons: Duration, Group size, Difficulty, Languages
**And** "About This Experience" section shows full description from experiences table
**And** page loads experience data by experience_id from experiences table
**And** all sections scroll vertically
**And** images lazy load as user scrolls
**And** parallax effect on hero image as user scrolls (subtle)

### Story 6.6: Display "What's Included" Section

As a traveler viewing an experience,
I want to see what's included in the price,
So that I know what I'm paying for.

**Acceptance Criteria:**

**Given** I am on an experience detail page from Story 6.5
**When** I scroll to "What's Included" section
**Then** I see two subsections:
  - "What's Included" with green checkmarks (✓)
  - "Not Included" with X marks (✗)
**And** included items load from experience_inclusions where is_included = true
**And** excluded items load from experience_inclusions where is_included = false
**And** each item displays as a list item with icon and text
**And** section has white card background with 20px padding
**And** items are displayed in the order they were added by vendor

### Story 6.7: Show Operator Profile on Experience Page

As a traveler,
I want to learn about the local operator,
So that I feel confident booking with them.

**Acceptance Criteria:**

**Given** I am on an experience detail page
**When** I scroll to "Meet Your Local Operator" section
**Then** I see a card with warm coral background (oklch(0.68 0.17 25) at 10% opacity)
**And** card displays:
  - Circular vendor photo (from vendors.photo_url, 80px diameter)
  - Vendor business_name
  - Tagline "Family operated since {vendors.since_year}"
  - Short bio (from vendors.bio, max 300 chars with "read more" if truncated)
  - Badge row: "Local Business", "Verified Partner" (if vendors.verified = true), "Responds in X hours" (from vendors.avg_response_time)
**And** "Message Operator" button (secondary coral outline)
**When** I tap vendor name or photo
**Then** vendor full profile modal opens with complete bio and all their experiences

### Story 6.8: Display Reviews and Ratings

As a traveler,
I want to read reviews from other travelers,
So that I can gauge experience quality.

**Acceptance Criteria:**

**Given** I am on an experience detail page
**When** I scroll to "What Travelers Say" section
**Then** I see:
  - Large rating display: "4.9" with star icon and "127 reviews"
  - Rating breakdown bars: 5 star (90%), 4 star (7%), 3 star (2%), 2 star (1%), 1 star (0%)
**And** "Traveler Photos" subsection shows horizontal scrollable row of user-submitted review photos
**And** review cards display (latest 3 shown, with "See all reviews" link):
  - Reviewer first name and country flag emoji (from reviews.reviewer_country)
  - Date: "December 2024" (formatted from reviews.created_at)
  - Star rating (1-5 stars as icons)
  - Review text (truncated at 3 lines with "read more" link)
  - "Helpful" button with count (reviews.helpful_count)
**And** reviews load from reviews table filtered by experience_id, ordered by created_at DESC
**And** average rating is calculated from AVG(reviews.rating)
**When** I tap "See all reviews"
**Then** modal opens showing all reviews with infinite scroll

### Story 6.9: Add Meeting Point Information

As a traveler,
I want to know where to meet for the experience,
So that I can plan my arrival.

**Acceptance Criteria:**

**Given** I am on an experience detail page
**When** I scroll to "Where You'll Meet" section
**Then** I see:
  - Embedded static map image showing meeting location (via Google Maps Static API or Mapbox)
  - Meeting point name (from experiences.meeting_point_name)
  - Full address (from experiences.meeting_point_address)
  - Copy icon button next to address (copies to clipboard on tap)
  - "Get Directions" link (opens default maps app with coordinates)
  - Additional instructions (from experiences.meeting_instructions) if provided
**And** map marker shows at experiences.meeting_point_lat, meeting_point_lng
**When** I tap "Get Directions"
**Then** deep link opens to: Google Maps on Android, Apple Maps on iOS with destination pre-filled

### Story 6.10: Show Cancellation Policy and Policies

As a traveler,
I want to understand the cancellation policy,
So that I know my options if plans change.

**Acceptance Criteria:**

**Given** I am on an experience detail page
**When** I scroll to "Good to Know" section
**Then** I see subsections:
  - **Cancellation Policy**: Friendly language (from experiences.cancellation_policy), e.g., "Free cancellation up to 24 hours before. Full refund, no questions asked."
  - **What to Bring**: Comma-separated list (from experiences.what_to_bring), e.g., "Sunscreen, swimwear, camera"
  - **Health & Safety**: Any relevant notes (from experiences.health_safety_notes)
**And** section has clear typography hierarchy (title 20px bold, content 16px regular)
**And** policies display with bullet points for easy scanning

---

## Epic 7: Wishlist & Saved Experiences

**Goal:** Users save favorite experiences to wishlist with heart icon toggle, view all saved items, and quickly add saved experiences to active trip plans.

### Story 7.1: Implement Heart Icon Save Toggle

As a traveler browsing experiences,
I want to tap a heart icon to save an experience,
So that I can quickly bookmark activities I'm interested in.

**Acceptance Criteria:**

**Given** I am viewing an experience card (in browse or detail view)
**When** I tap the heart icon
**Then** the heart animates with a "pop" effect (200ms bounce)
**And** heart fills with warm coral color (#FF6B6B)
**And** experience is saved to saved_experiences table (user_id, experience_id, saved_at)
**And** toast notification displays "Saved to wishlist"
**When** I tap the filled heart again
**Then** heart animates back to outline state
**And** record is removed from saved_experiences table
**And** toast displays "Removed from wishlist"
**And** saved state persists via Spark useKV for offline access

### Story 7.2: Create Saved/Wishlist Screen

As a traveler,
I want to view all my saved experiences in one place,
So that I can easily revisit and compare options.

**Acceptance Criteria:**

**Given** I tap the "Saved" tab in bottom navigation (Heart icon)
**When** the Saved screen loads
**Then** I see all my saved experiences displayed as cards
**And** cards show: hero image, title, price, rating, saved date
**And** cards are sorted by saved_at DESC (most recent first)
**And** each card has heart icon (filled) and "Add to Trip" button
**And** list loads from saved_experiences table joined with experiences
**When** I have no saved experiences
**Then** empty state displays: heart illustration, "Your wishlist is empty", "Start exploring" CTA button
**And** CTA navigates to home screen

### Story 7.3: Quick Add from Wishlist to Trip

As a traveler viewing my wishlist,
I want to quickly add saved experiences to my current trip,
So that trip planning is fast and seamless.

**Acceptance Criteria:**

**Given** I am on the Saved/Wishlist screen
**When** I tap "Add to Trip" on a saved experience
**Then** experience is added to my current active trip (trip_items table)
**And** item "flies" animation toward trip bar (150ms ease-out)
**And** trip total price updates in real-time
**And** toast displays "Added to trip"
**And** experience remains in wishlist (not removed)
**When** the experience is already in my trip
**Then** button changes to "Already in Trip" (disabled state)
**And** no duplicate items can be added

---

## Epic 8: Trip Canvas & Itinerary Building

**Goal:** Travelers visually build custom trip itineraries by adding experiences with calendar/list view toggle, real-time pricing calculation, date management, unscheduled items section, and offline persistence.

### Story 8.1: Create Trip Data Model and Persistence

As a developer,
I want a trip data model with Spark KV persistence,
So that trip data survives page refreshes and offline use.

**Acceptance Criteria:**

**Given** the application loads
**When** useKV hook initializes for trips
**Then** trips are stored with structure: { id, user_id, name, start_date, end_date, items[], status, created_at, updated_at }
**And** trip_items have structure: { id, trip_id, experience_id, scheduled_date, scheduled_time, guest_count, notes, created_at }
**And** default empty trip is created for new users
**And** null safety pattern is applied: `const safeTrip = trip || defaultTrip`
**And** updater functions check for null: `setTrip(current => { const base = current || defaultTrip; ... })`
**And** trip data persists across browser sessions

### Story 8.2: Build Trip Canvas Home View

As a traveler,
I want to see my trip overview on the home screen,
So that I can quickly understand my planned activities.

**Acceptance Criteria:**

**Given** I am on the home screen with an active trip
**When** the trip canvas section loads
**Then** I see trip header: trip name (editable), date range (or "Dates not set")
**And** trip summary bar shows: item count, total days, total price
**And** below header I see trip items organized by day
**And** each day section shows: day number, date, scheduled items
**And** each item card displays: time, experience title, duration, price, guest count
**And** "View Full Trip" button expands to detailed trip builder
**When** trip has no items
**Then** empty state shows: suitcase illustration, "Your trip canvas is empty", "Start Exploring" button

### Story 8.3: Implement Quick Add Experience to Trip

As a traveler browsing experiences,
I want to quickly add activities to my trip,
So that I can build my itinerary without leaving the browse view.

**Acceptance Criteria:**

**Given** I am viewing an experience card in any browse context
**When** I tap "+ Quick Add" button
**Then** experience is added to my active trip as unscheduled item
**And** item flies to trip bar with animation (150ms ease-out)
**And** trip bar price updates immediately to include new item
**And** trip item record created: { experience_id, guest_count: 1, scheduled_date: null }
**And** toast displays "Added to trip"
**When** I tap Quick Add for an experience already in trip
**Then** toast displays "Already in your trip"
**And** no duplicate is created

### Story 8.4: Create Detailed Trip Builder Screen

As a traveler,
I want a full-screen trip builder to organize my itinerary,
So that I can see all details and make adjustments.

**Acceptance Criteria:**

**Given** I tap "View Full Trip" or navigate to trip builder
**When** the trip builder screen loads
**Then** I see header with: back button, trip name (editable inline), share button
**And** date picker shows: arrival date, departure date (with calendar modal)
**And** trip items are grouped by scheduled date
**And** "Unscheduled" section shows items without dates
**And** sticky footer shows: item count, total price, "Continue to Booking" button
**And** total price calculates: SUM(experience.price × guest_count) for all items

### Story 8.5: Build Calendar View Toggle

As a traveler,
I want to switch between calendar and list views of my trip,
So that I can visualize my itinerary in my preferred format.

**Acceptance Criteria:**

**Given** I am on the trip builder screen
**When** I see the view toggle (Calendar | List)
**Then** default view is List (timeline)
**When** I tap "Calendar"
**Then** view switches to monthly calendar grid
**And** days with activities show colored dots (one dot per item)
**And** tapping a day shows that day's items in a bottom sheet
**And** current day is highlighted
**When** I tap "List"
**Then** view switches to vertical timeline
**And** items grouped by day with connecting timeline lines
**And** smooth transition animation between views (200ms)

### Story 8.6: Implement Item Scheduling (Drag to Date)

As a traveler,
I want to schedule unscheduled items to specific days,
So that my itinerary has a logical flow.

**Acceptance Criteria:**

**Given** I have unscheduled items in my trip
**When** I long-press an unscheduled item
**Then** item becomes draggable with visual feedback (slight elevation, opacity change)
**When** I drag the item over a day section
**Then** day section highlights as drop target
**When** I release the item on a day
**Then** item moves to that day's section with animation
**And** trip_items.scheduled_date updates to the selected date
**And** item appears at end of that day's list
**When** I tap "Assign to Day" on an unscheduled item
**Then** date picker modal opens
**And** I can select a date from trip date range
**And** item updates and moves to selected day

### Story 8.7: Add Guest Count Adjustment per Item

As a traveler,
I want to adjust guest count for each experience in my trip,
So that pricing reflects my actual group size.

**Acceptance Criteria:**

**Given** I am viewing a trip item in the builder
**When** I tap the guest count
**Then** a stepper control appears (- 1 +)
**And** minimum is 1 guest, maximum is experience.group_size_max
**When** I adjust guest count
**Then** item price updates: experience.price × new_guest_count
**And** trip total updates immediately
**And** trip_items.guest_count persists to storage
**And** guest count displays as "2 guests" format

### Story 8.8: Implement Remove Item from Trip

As a traveler,
I want to remove experiences from my trip,
So that I can change my plans.

**Acceptance Criteria:**

**Given** I am viewing a trip item
**When** I swipe left on the item (mobile) or hover to reveal delete (desktop)
**Then** red "Remove" action appears
**When** I tap "Remove"
**Then** item is removed from trip_items
**And** item animates out (fade + slide)
**And** trip total recalculates
**And** toast displays "Removed from trip" with "Undo" action (5 seconds)
**When** I tap "Undo"
**Then** item is restored to trip
**And** no confirmation modal for removal (non-destructive, can re-add)

### Story 8.9: Handle Date Not Set Flow

As a traveler who hasn't set trip dates,
I want to browse and add items without dates,
So that I can plan before committing to dates.

**Acceptance Criteria:**

**Given** my trip has no dates set (start_date and end_date are null)
**When** I add items to trip
**Then** all items go to "Unscheduled" section
**And** trip builder shows "Set your dates" prompt at top
**When** I tap "Continue to Booking" without dates
**Then** modal prompts: "When are you traveling?"
**And** date picker with "Set Dates" and "Skip for now" buttons
**When** I set dates
**Then** unscheduled items remain unscheduled (not auto-assigned)
**And** I can now drag items to specific days

### Story 8.10: Real-Time Price Calculation Display

As a traveler,
I want to see my trip total update in real-time,
So that I always know my current spend.

**Acceptance Criteria:**

**Given** I have items in my trip
**When** viewing any trip context (canvas, builder, or checkout)
**Then** price breakdown shows:
  - Subtotal: SUM(each item's price × guest_count)
  - Service Fee: subtotal × 0.10 (10%)
  - Total: subtotal + service_fee
**And** all prices formatted with currency symbol (e.g., "$125.00")
**When** I add, remove, or adjust guest count
**Then** all price values update within 100ms
**And** animations highlight changed values briefly

---

## Epic 9: Scheduling & Conflict Detection

**Goal:** System automatically detects when activities overlap in time, displays yellow warning banners with smart suggestions, and provides trip sharing via shareable links.

### Story 9.1: Implement Time Conflict Detection Algorithm

As a developer,
I want an algorithm that detects scheduling conflicts,
So that users are warned about overlapping activities.

**Acceptance Criteria:**

**Given** trip items have scheduled_date and scheduled_time
**When** conflict detection runs (on any item change)
**Then** algorithm checks: for each day, are any item time ranges overlapping?
**And** time range = scheduled_time to (scheduled_time + experience.duration_hours)
**And** conflicts identified when: itemA.end_time > itemB.start_time AND itemA.start_time < itemB.end_time
**And** conflict data stored: { item_ids: [id1, id2], overlap_minutes, date }
**And** algorithm runs in <50ms for up to 20 items per day

### Story 9.2: Display Conflict Warning Banners

As a traveler,
I want to see visual warnings when activities overlap,
So that I can fix scheduling issues.

**Acceptance Criteria:**

**Given** a scheduling conflict is detected from Story 9.1
**When** I view the trip builder
**Then** conflicting items show yellow warning banner
**And** banner displays: warning icon (⚠️), "Schedule conflict with [other item name]"
**And** banner background uses Golden Sand color (#F4D03F at 20% opacity)
**And** banner appears between the two conflicting item cards
**When** conflict is resolved (item moved or removed)
**Then** warning banner disappears with fade animation

### Story 9.3: Provide Smart Conflict Resolution Suggestions

As a traveler with a scheduling conflict,
I want suggestions to resolve the overlap,
So that I can quickly fix my itinerary.

**Acceptance Criteria:**

**Given** a conflict warning banner is displayed
**When** I tap the warning banner
**Then** a bottom sheet opens with resolution options:
  - "Move [Item A] to [suggested time]" (next available slot)
  - "Move [Item B] to [suggested time]"
  - "Move [Item A] to another day"
  - "Remove [Item A] from trip"
**And** suggestions are calculated based on item durations and available gaps
**When** I select a suggestion
**Then** the action is applied immediately
**And** conflict detection re-runs
**And** toast confirms "Conflict resolved"

### Story 9.4: Create Shareable Trip Links

As a traveler,
I want to share my trip plan with others,
So that travel companions can see the itinerary.

**Acceptance Criteria:**

**Given** I am on the trip builder screen
**When** I tap the share button (top right)
**Then** a share modal opens with options:
  - "Copy Link" - copies shareable URL to clipboard
  - "Share via..." - opens native share sheet (mobile)
**And** shareable link format: `https://pulau.app/trip/{share_token}`
**And** share_token is a unique UUID stored in trips.share_token
**When** someone opens the shared link
**Then** they see a read-only view of the trip
**And** read-only view shows: trip name, dates, all items with details, total price
**And** "Create your own trip" CTA at bottom
**And** shared trips do not require login to view

---

## Epic 10: Multi-Step Checkout & Booking

**Goal:** Travelers complete secure bookings through guided 4-step checkout (Review → Traveler Details → Payment → Confirmation) with form validation, session persistence, payment processing, and success animations.

### Story 10.1: Create Checkout Flow Navigation

As a traveler ready to book,
I want a clear multi-step checkout process,
So that I can complete my booking with confidence.

**Acceptance Criteria:**

**Given** I tap "Continue to Booking" from trip builder
**When** checkout flow initiates
**Then** I see a 4-step progress indicator at top:
  - Step 1: Review (active)
  - Step 2: Traveler Details
  - Step 3: Payment
  - Step 4: Confirmation
**And** progress bar fills as I advance through steps
**And** step labels show: completed (checkmark), current (filled circle), upcoming (empty circle)
**And** I can tap completed steps to go back
**And** I cannot skip ahead to future steps
**And** checkout state persists to session (survives page refresh)

### Story 10.2: Build Step 1 - Trip Review Screen

As a traveler in checkout,
I want to review my complete trip before providing details,
So that I can confirm my selections.

**Acceptance Criteria:**

**Given** I am on checkout Step 1 (Review)
**When** the screen loads
**Then** I see all trip items displayed:
  - Experience image thumbnail
  - Experience title
  - Scheduled date and time (or "Unscheduled")
  - Guest count with edit button
  - Item price (price × guests)
**And** price summary at bottom: Subtotal, Service Fee (10%), Total
**And** "Edit Trip" link returns to trip builder
**And** "Continue" button advances to Step 2
**When** I tap edit on guest count
**Then** inline stepper allows adjustment
**And** prices update immediately

### Story 10.3: Build Step 2 - Traveler Details Form

As a traveler in checkout,
I want to enter my contact and traveler information,
So that operators can reach me.

**Acceptance Criteria:**

**Given** I am on checkout Step 2 (Traveler Details)
**When** the screen loads
**Then** form displays fields (pre-filled if logged in):
  - Primary Contact: First Name*, Last Name*, Email*, Phone*
  - Trip Lead: Same as contact (checkbox), or separate fields
  - Special Requests: textarea (optional)
**And** fields marked with * are required
**And** form uses React Hook Form with Zod validation schema
**When** I submit with missing required fields
**Then** validation errors display inline below each field
**And** error border (red) highlights invalid fields
**When** all required fields are valid
**Then** "Continue to Payment" button enables
**And** form data persists to checkout session state

### Story 10.4: Build Step 3 - Payment Screen

As a traveler in checkout,
I want to enter payment information securely,
So that I can complete my purchase.

**Acceptance Criteria:**

**Given** I am on checkout Step 3 (Payment)
**When** the screen loads
**Then** I see order summary: item count, total price
**And** saved payment methods display (if any from user profile)
**And** "Add New Card" option with fields:
  - Card Number (with card brand icon detection)
  - Expiry Date (MM/YY)
  - CVV
  - Cardholder Name
**And** alternative payment buttons: PayPal, Apple Pay (if available), Google Pay (if available)
**And** "Save this card for future bookings" checkbox
**When** I select a saved card
**Then** CVV re-entry is required for security
**When** I enter card details
**Then** card number formats automatically (#### #### #### ####)
**And** card brand icon appears (Visa/Mastercard/Amex)
**And** validation runs on blur and submit

### Story 10.5: Implement Payment Processing

As a traveler submitting payment,
I want my payment processed securely,
So that my booking is confirmed.

**Acceptance Criteria:**

**Given** I tap "Pay $XXX" button on payment screen
**When** payment processing begins
**Then** button shows loading spinner and "Processing..."
**And** all form inputs are disabled during processing
**And** payment token is generated via payment gateway (Stripe/PayPal)
**And** booking record created in bookings table:
  - id, user_id, trip_id, status: 'pending', total_amount, payment_token, created_at
**When** payment succeeds
**Then** booking status updates to 'confirmed'
**And** booking_reference generated (format: PL-XXXXXX)
**And** user advances to Step 4 (Confirmation)
**When** payment fails
**Then** error message displays: "Payment failed: [reason]"
**And** "Try Again" button allows retry
**And** booking status remains 'pending' or 'failed'

### Story 10.6: Build Step 4 - Confirmation Screen

As a traveler who completed booking,
I want to see my booking confirmation,
So that I know my reservation is secured.

**Acceptance Criteria:**

**Given** payment succeeded and I'm on Step 4 (Confirmation)
**When** the screen loads
**Then** success animation plays: confetti burst (500ms) with green checkmark
**And** confirmation displays:
  - "Booking Confirmed!" heading
  - Booking reference: PL-XXXXXX (tappable to copy)
  - "Confirmation sent to [email]" message
  - Trip summary: dates, item count, total paid
**And** action buttons:
  - "View My Trips" (primary) - navigates to booking history
  - "Back to Home" (secondary)
**And** confirmation email is triggered (queued for sending)
**And** trip status updates from 'planning' to 'booked'

### Story 10.7: Implement Form Validation with Zod

As a developer,
I want consistent form validation across checkout,
So that user input is validated reliably.

**Acceptance Criteria:**

**Given** checkout forms use React Hook Form
**When** Zod schemas are defined
**Then** travelerDetailsSchema validates:
  - firstName: string, min 1, max 50
  - lastName: string, min 1, max 50
  - email: valid email format
  - phone: valid phone format (international)
**And** paymentSchema validates:
  - cardNumber: 13-19 digits (Luhn algorithm)
  - expiryDate: MM/YY format, not expired
  - cvv: 3-4 digits
  - cardholderName: string, min 2
**And** validation errors display user-friendly messages
**And** form submission is blocked until valid

### Story 10.8: Session Persistence for Incomplete Bookings

As a traveler who gets interrupted during checkout,
I want my progress saved,
So that I can resume where I left off.

**Acceptance Criteria:**

**Given** I am partway through checkout and close the browser/app
**When** I return to the app within 24 hours
**Then** I see a prompt: "Continue your booking?"
**And** my checkout progress is restored (step, form data, trip items)
**And** checkout session stored in Spark useKV with expiry timestamp
**When** session is older than 24 hours
**Then** session is cleared
**And** user starts fresh from trip builder
**When** I complete booking or explicitly cancel
**Then** checkout session is cleared

---

## Epic 11: Booking Management & History

**Goal:** Users view booking history with upcoming/past tabs, manage active trips, access booking confirmations and references, utilize "Book Again" to duplicate past trips, and experience active trip mode during travel dates.

### Story 11.1: Create Booking History Screen

As a traveler,
I want to view all my bookings in one place,
So that I can manage my travel plans.

**Acceptance Criteria:**

**Given** I navigate to Profile → My Trips
**When** the booking history screen loads
**Then** I see tabs: "Upcoming" (default), "Past", "All"
**And** each tab filters bookings by status and dates
**And** "Upcoming" shows: status = 'confirmed' AND trip.start_date >= today
**And** "Past" shows: trip.end_date < today OR status = 'completed'
**And** booking cards display: trip name, dates, item count, total price, status badge
**And** cards sorted by trip.start_date (nearest first for upcoming, most recent first for past)
**And** empty state shows: suitcase icon, "No [upcoming/past] trips", "Explore experiences" CTA

### Story 11.2: Build Booking Detail View

As a traveler,
I want to view complete details of a booking,
So that I can access all confirmation information.

**Acceptance Criteria:**

**Given** I tap a booking card from history
**When** the booking detail screen loads
**Then** I see read-only trip view identical to trip builder layout
**And** header shows: booking reference (copyable), status badge, booked date
**And** all trip items display with: date, time, experience details, guest count
**And** operator contact info visible for each experience
**And** meeting point info accessible
**And** price summary shows: what was paid, payment method last 4 digits
**And** "Need Help?" link to support
**And** screen is read-only (no editing capabilities)

### Story 11.3: Implement "Book Again" Functionality

As a traveler who enjoyed a past trip,
I want to quickly rebook the same experiences,
So that I can plan a return visit easily.

**Acceptance Criteria:**

**Given** I am viewing a past/completed booking
**When** I tap "Book Again" button
**Then** a new trip is created copying all items from the original booking
**And** new trip has: name = "[Original name] (Copy)", dates = null, status = 'planning'
**And** all trip_items are copied with: same experiences, same guest counts
**And** scheduled_dates are cleared (items become unscheduled)
**And** I am navigated to the trip builder with the new trip
**And** toast displays "Trip copied! Set your new dates."
**And** original booking remains unchanged

### Story 11.4: Add Booking Status Tracking

As a traveler,
I want to see the status of my bookings,
So that I know if they're confirmed or need attention.

**Acceptance Criteria:**

**Given** bookings have various statuses
**When** I view booking cards or details
**Then** status badges display with appropriate colors:
  - "Confirmed" - green badge (#27AE60)
  - "Pending" - yellow badge (#F4D03F)
  - "Cancelled" - gray badge
  - "Completed" - teal badge (#0D7377)
**And** status stored in bookings.status enum
**And** status updates based on:
  - 'confirmed' after successful payment
  - 'completed' after trip.end_date passes
  - 'cancelled' if user cancels
**And** status changes log to booking_status_history table

### Story 11.5: Create Active Trip Mode

As a traveler during my booked trip,
I want an enhanced home screen experience,
So that I can easily access today's activities.

**Acceptance Criteria:**

**Given** I have a confirmed booking AND today is within trip date range
**When** I open the app / view home screen
**Then** home screen transforms to "Active Trip Mode":
  - Top banner: "Day X of your Bali adventure!"
  - Countdown: "X days remaining"
  - "Today's Schedule" section prominently displayed
  - Today's items with times, meeting points, quick directions
**And** each item has "View Details" expanding to full info
**And** "View Full Itinerary" button shows complete trip
**And** weather widget for Bali (if API available)
**When** trip ends (after end_date)
**Then** home screen returns to normal planning mode
**And** past trip moves to "Past" tab

### Story 11.6: Implement Booking Cancellation Flow

As a traveler who needs to cancel,
I want to cancel my booking according to policy,
So that I can get a refund if eligible.

**Acceptance Criteria:**

**Given** I am viewing a confirmed booking detail
**When** I tap "Cancel Booking"
**Then** modal displays cancellation policy for each experience
**And** refund calculation shows:
  - Full refund if > 24 hours before each experience
  - Partial/no refund if within 24 hours
  - Total refund amount
**When** I confirm cancellation
**Then** booking status updates to 'cancelled'
**And** refund is initiated via payment gateway
**And** cancellation confirmation email sent
**And** toast displays "Booking cancelled. Refund processing."
**And** cancelled booking remains visible in history (grayed out)

---

## Epic 12: Explore & Discovery Features

**Goal:** Users discover content through Explore screen with curated sections: Trending in Bali, Hidden Gems, Limited Availability alerts, Destination Guides, and Stories from Travelers.

### Story 12.1: Build Explore Screen Layout

As a traveler looking for inspiration,
I want a discovery-focused explore screen,
So that I can find interesting experiences beyond categories.

**Acceptance Criteria:**

**Given** I tap "Explore" in bottom navigation (Compass icon)
**When** the Explore screen loads
**Then** I see vertically scrolling sections:
  - Search bar at top (sticky)
  - "Trending in Bali" horizontal carousel
  - "Hidden Gems" horizontal carousel
  - "Limited Availability" horizontal carousel
  - "Destination Guides" grid (2 columns)
  - "Stories from Travelers" vertical list
**And** each section has "See All" link
**And** pull-to-refresh triggers content refresh
**And** skeleton loading states while data loads

### Story 12.2: Create Trending Experiences Section

As a traveler,
I want to see what's popular,
So that I can discover highly-booked experiences.

**Acceptance Criteria:**

**Given** I am on the Explore screen
**When** "Trending in Bali" section loads
**Then** I see horizontal carousel of 6-10 experience cards
**And** trending calculated by: booking_count in last 30 days, minimum 10 bookings
**And** cards display: image, title, "🔥 X booked this week" badge, price
**And** cards are slightly larger than category browse cards
**When** I swipe horizontally
**Then** carousel scrolls smoothly with snap-to-card behavior
**When** I tap a trending card
**Then** I navigate to experience detail page

### Story 12.3: Create Hidden Gems Section

As a traveler seeking unique experiences,
I want to discover lesser-known gems,
So that I can have authentic local experiences.

**Acceptance Criteria:**

**Given** I am on the Explore screen
**When** "Hidden Gems" section loads
**Then** I see horizontal carousel of experiences
**And** hidden gems identified by: rating >= 4.5 AND booking_count < 50 AND review_count >= 5
**And** cards display: image, title, "💎 Local Secret" badge, rating, price
**And** badge uses Golden Sand color (#F4D03F)
**When** I tap "See All"
**Then** I navigate to filtered browse showing all hidden gems

### Story 12.4: Create Limited Availability Alerts

As a traveler,
I want to see experiences with limited spots,
So that I can book before they sell out.

**Acceptance Criteria:**

**Given** I am on the Explore screen
**When** "Limited Availability" section loads
**Then** I see experiences with low remaining slots
**And** limited = experience_availability.slots_available <= 5 for next 7 days
**And** cards display: image, title, "Only X spots left!" badge (red/coral), date, price
**And** urgency styling: coral border, pulsing badge animation
**When** availability updates (spots fill)
**Then** section content refreshes on next load
**And** fully booked experiences move to "Sold Out" state

### Story 12.5: Create Destination Guides Section

As a traveler planning a trip,
I want to read curated destination guides,
So that I can learn about different areas of Bali.

**Acceptance Criteria:**

**Given** I am on the Explore screen
**When** "Destination Guides" section loads
**Then** I see 2-column grid of guide cards:
  - Ubud (Culture & Rice Terraces)
  - Seminyak (Beach & Nightlife)
  - Uluwatu (Surf & Cliffs)
  - Nusa Islands (Island Hopping)
**And** each card has: cover image, destination name, tagline
**When** I tap a guide card
**Then** guide detail page opens with:
  - Hero image
  - Overview text
  - "Top Experiences" list (filtered by destination)
  - Map of area
  - "Best For" tags

### Story 12.6: Create Traveler Stories Section

As a traveler seeking social proof,
I want to read stories from other travelers,
So that I can learn from their experiences.

**Acceptance Criteria:**

**Given** I am on the Explore screen
**When** "Stories from Travelers" section loads
**Then** I see vertical list of story cards
**And** stories sourced from reviews with photos and 200+ character text
**And** card displays: traveler photo, name, country, story excerpt, experience thumbnail
**And** cards expandable to show full story
**When** I tap "Read More" on a story
**Then** full review displays with all photos
**And** link to the experience being reviewed

---

## Epic 13: Profile & Settings Management

**Goal:** Users manage comprehensive profile (photo, name, member since), payment methods, notification preferences, currency selection, language settings, and access help, about, terms, and privacy pages.

### Story 13.1: Build Profile Screen Layout

As a logged-in user,
I want to view and access my profile settings,
So that I can manage my account.

**Acceptance Criteria:**

**Given** I tap "Profile" in bottom navigation (User icon)
**When** the Profile screen loads
**Then** I see profile header:
  - Profile photo (circular, 80px, or placeholder avatar)
  - Full name
  - "Member since [month year]"
  - "Edit Profile" button
**And** below header, menu sections:
  - My Trips (→ booking history)
  - Saved Experiences (→ wishlist)
  - Payment Methods
  - Notifications
  - Preferences (currency, language)
  - Help & Support
  - About Pulau
  - Log Out
**And** each menu item has icon, label, and chevron

### Story 13.2: Create Edit Profile Screen

As a user,
I want to edit my profile information,
So that my account details are current.

**Acceptance Criteria:**

**Given** I tap "Edit Profile" from profile screen
**When** the edit profile screen loads
**Then** I see form with current values:
  - Profile photo with "Change Photo" overlay
  - First Name input
  - Last Name input
  - Phone Number input
  - Email (read-only, displays "Contact support to change")
**When** I tap profile photo
**Then** options appear: "Take Photo", "Choose from Library", "Remove Photo"
**And** selected photo crops to square and uploads
**When** I save changes
**Then** user_profiles table updates
**And** toast displays "Profile updated"
**And** I return to profile screen with updated info

### Story 13.3: Build Payment Methods Management

As a user,
I want to manage my saved payment methods,
So that checkout is convenient.

**Acceptance Criteria:**

**Given** I tap "Payment Methods" from profile
**When** the payment methods screen loads
**Then** I see list of saved cards:
  - Card brand icon (Visa/Mastercard/Amex)
  - "•••• [last 4 digits]"
  - Expiry date
  - "Default" badge if is_default = true
**And** "+ Add New Card" button at bottom
**When** I tap a card
**Then** options: "Set as Default", "Remove"
**When** I tap "Remove"
**Then** confirmation modal: "Remove this card?"
**And** on confirm, card soft-deleted (deleted_at set)
**When** I tap "Add New Card"
**Then** card entry form opens (same as checkout)

### Story 13.4: Implement Notification Preferences

As a user,
I want to control what notifications I receive,
So that I only get relevant alerts.

**Acceptance Criteria:**

**Given** I tap "Notifications" from profile
**When** the notifications settings screen loads
**Then** I see toggle switches for:
  - Booking Confirmations (default: on)
  - Trip Reminders (default: on)
  - Price Drops on Saved (default: on)
  - New Experiences (default: off)
  - Marketing & Promotions (default: off)
**And** toggles save immediately on change to user_notification_preferences table
**And** toggle uses primary teal color when on

### Story 13.5: Add Currency and Language Settings

As an international traveler,
I want to set my preferred currency and language,
So that the app displays in my preferences.

**Acceptance Criteria:**

**Given** I tap "Preferences" from profile
**When** the preferences screen loads
**Then** I see:
  - Currency selector: USD (default), EUR, GBP, AUD, SGD, IDR
  - Language selector: English (default), Indonesian, Mandarin
**When** I change currency
**Then** all prices throughout app convert and display in new currency
**And** exchange rates fetched daily and cached
**And** user_preferences.currency persists selection
**When** I change language
**Then** app interface text changes to selected language
**And** user_preferences.language persists selection
**And** page refreshes to apply language change

### Story 13.6: Create Help & Support Screen

As a user needing assistance,
I want to access help and support,
So that I can resolve issues.

**Acceptance Criteria:**

**Given** I tap "Help & Support" from profile
**When** the help screen loads
**Then** I see sections:
  - FAQ accordion (common questions)
  - "Contact Us" with email link
  - "Live Chat" button (if implemented)
  - "Report a Problem" form link
**And** FAQ topics: Booking, Payments, Cancellations, Account
**When** I tap FAQ question
**Then** answer expands below
**When** I tap "Contact Us"
**Then** email client opens with support@pulau.app

### Story 13.7: Add About, Terms, and Privacy Pages

As a user,
I want to access legal and company information,
So that I understand the service.

**Acceptance Criteria:**

**Given** I tap "About Pulau" from profile
**When** the about screen loads
**Then** I see:
  - Pulau logo and tagline
  - App version number
  - Brief company description
  - Links: "Terms of Service", "Privacy Policy", "Licenses"
**When** I tap Terms or Privacy
**Then** respective policy page opens (markdown rendered or webview)
**And** content loads from static files or CMS
**And** pages are scrollable with proper formatting

---

## Epic 14: Vendor Analytics & Revenue Tracking

**Goal:** Vendors track business performance with analytics dashboard showing booking metrics, revenue tracking, view counts, conversion rates, and customer engagement data.

### Story 14.1: Build Vendor Analytics Dashboard

As a vendor,
I want to see my business performance metrics,
So that I can understand how my experiences are doing.

**Acceptance Criteria:**

**Given** I am logged in as a vendor
**When** I navigate to "Analytics" in vendor portal
**Then** I see dashboard with key metrics cards:
  - Total Revenue (this month vs last month, % change)
  - Total Bookings (this month vs last month)
  - Average Rating (overall, with trend arrow)
  - Profile Views (this month)
**And** each card has icon, value, comparison text
**And** date range selector: "This Week", "This Month", "This Year", "Custom"
**And** metrics refresh on date range change

### Story 14.2: Create Revenue Chart Visualization

As a vendor,
I want to see revenue trends over time,
So that I can identify patterns in my business.

**Acceptance Criteria:**

**Given** I am on the vendor analytics dashboard
**When** the revenue section loads
**Then** I see a line chart showing:
  - X-axis: time periods (days/weeks/months based on range)
  - Y-axis: revenue in vendor's currency
  - Line with data points
  - Hover/tap shows exact value for each point
**And** chart uses primary teal color
**And** "Total for Period" displayed above chart
**And** chart renders smoothly with animation on load

### Story 14.3: Display Experience Performance Table

As a vendor with multiple experiences,
I want to see which experiences perform best,
So that I can focus my efforts.

**Acceptance Criteria:**

**Given** I am on vendor analytics
**When** I scroll to "Experience Performance" section
**Then** I see a sortable table with columns:
  - Experience Name
  - Views (experience page loads)
  - Bookings
  - Conversion Rate (bookings/views %)
  - Revenue
  - Avg Rating
**And** table sortable by clicking column headers
**And** default sort: Revenue descending
**And** sparkline mini-chart for each row showing trend
**When** I click an experience row
**Then** I navigate to that experience's detailed analytics

### Story 14.4: Implement Conversion Funnel View

As a vendor,
I want to see where travelers drop off,
So that I can improve my listings.

**Acceptance Criteria:**

**Given** I am viewing detailed analytics for an experience
**When** the funnel section loads
**Then** I see visual funnel showing:
  - Impressions (shown in browse) → X travelers
  - Page Views (detail page) → Y travelers
  - Added to Trip → Z travelers
  - Booked → N travelers
**And** percentage drop-off shown between each stage
**And** funnel colored with gradient (teal to coral)
**And** suggestions displayed if conversion is below benchmark

---

## Epic 15: Real-time Availability & Messaging

**Goal:** Customers see real-time experience availability, vendors update availability calendars instantly, and both parties communicate via messaging system for special requests and booking coordination.

### Story 15.1: Display Real-time Availability on Experience Pages

As a traveler,
I want to see current availability for experiences,
So that I can book dates that work.

**Acceptance Criteria:**

**Given** I am on an experience detail page
**When** the availability section loads
**Then** I see a calendar showing next 60 days
**And** each date shows availability status:
  - Green: Available (slots > 50%)
  - Yellow: Limited (slots 1-50%)
  - Red: Sold Out (slots = 0)
  - Gray: Not Operating (no availability record)
**And** availability loads from experience_availability table
**When** I tap an available date
**Then** date selects and "Add to Trip" prefills with that date
**And** slots remaining displays: "X spots left"

### Story 15.2: Enable Vendor Calendar Quick Updates

As a vendor,
I want to quickly update availability from my phone,
So that I can manage cancellations on the go.

**Acceptance Criteria:**

**Given** I am a vendor viewing my experience availability
**When** I tap a date on the calendar
**Then** quick edit modal opens with:
  - Date displayed
  - Slots Available (number input)
  - Status toggle: Available / Blocked
  - "Save" and "Cancel" buttons
**When** I save changes
**Then** experience_availability record updates immediately
**And** change reflects on customer-facing pages within 1 second
**And** toast confirms "Availability updated"
**And** if I block a date with existing bookings, warning shows with affected bookings

### Story 15.3: Create Messaging Thread List

As a vendor or traveler,
I want to see all my message conversations,
So that I can communicate about bookings.

**Acceptance Criteria:**

**Given** I navigate to "Messages" (inbox icon in header)
**When** the messages screen loads
**Then** I see list of conversation threads
**And** each thread shows:
  - Other party's name and photo
  - Experience name (context)
  - Last message preview (truncated)
  - Timestamp
  - Unread badge (if new messages)
**And** threads sorted by last_message_at DESC
**And** threads load from messages table grouped by conversation_id
**When** I tap a thread
**Then** I open the full conversation view

### Story 15.4: Build Messaging Conversation View

As a vendor or traveler,
I want to send and receive messages about a booking,
So that I can coordinate special requests.

**Acceptance Criteria:**

**Given** I tap a message thread
**When** the conversation view loads
**Then** I see:
  - Header: other party name, experience title
  - Message bubbles: my messages (right, teal), their messages (left, gray)
  - Each message shows: text, timestamp, read receipt (✓✓)
  - Text input at bottom with send button
**When** I type and tap send
**Then** message saves to messages table (sender_id, receiver_id, conversation_id, content, sent_at)
**And** message appears immediately in my view
**And** message delivers to other party (real-time if online, otherwise on next load)
**When** other party sends a message
**Then** it appears in my view (poll every 10 seconds, or websocket if implemented)

### Story 15.5: Implement Pre-Booking Questions

As a traveler,
I want to ask the operator a question before booking,
So that I can clarify details.

**Acceptance Criteria:**

**Given** I am on an experience detail page
**When** I tap "Message Operator" button
**Then** new message compose modal opens
**And** experience context auto-attached to message
**And** placeholder text: "Ask about this experience..."
**When** I send the message
**Then** conversation thread created if none exists
**And** message delivered to vendor
**And** I'm navigated to the conversation thread
**And** vendor receives notification of new message

---

## Epic 16: Mobile-First Responsive Design

**Goal:** All features work seamlessly across mobile, tablet, and desktop with responsive breakpoints, touch targets, animations, design system, typography, spacing, and accessibility compliance.

### Story 16.1: Implement Mobile-First Breakpoint System

As a developer,
I want consistent responsive breakpoints,
So that layouts adapt properly across devices.

**Acceptance Criteria:**

**Given** Tailwind CSS is configured
**When** breakpoints are applied
**Then** breakpoints follow mobile-first approach:
  - Default (no prefix): mobile < 640px
  - sm: >= 640px (large phones, small tablets)
  - md: >= 768px (tablets)
  - lg: >= 1024px (desktops)
**And** all components use mobile-first classes
**And** testing confirms layouts at all breakpoints
**And** no horizontal scroll on any screen size

### Story 16.2: Ensure Touch Target Compliance

As a mobile user,
I want all interactive elements to be easily tappable,
So that I don't accidentally tap the wrong thing.

**Acceptance Criteria:**

**Given** mobile users interact via touch
**When** interactive elements are rendered
**Then** all buttons, links, and tappable areas have minimum 44x44px touch target
**And** touch targets don't overlap
**And** increased tap padding on small elements (icons, close buttons)
**And** audit tool confirms compliance
**And** Tailwind classes like `min-h-[44px] min-w-[44px]` applied where needed

### Story 16.3: Implement Bottom Navigation with Safe Areas

As a mobile user,
I want easy-to-reach navigation,
So that I can navigate with one hand.

**Acceptance Criteria:**

**Given** I am using the app on mobile
**When** bottom navigation renders
**Then** tab bar is fixed at bottom, 64px height
**And** safe area inset applied for notched phones (env(safe-area-inset-bottom))
**And** 5 tabs: Home (House), Explore (Compass), Quick Add (PlusCircle), Saved (Heart), Profile (User)
**And** active tab highlighted with teal color and filled icon
**And** inactive tabs show outline icons in gray
**When** I tap Quick Add (center)
**Then** modal/sheet opens for category selection (not a separate screen)

### Story 16.4: Apply Bali-Inspired Design System

As a user,
I want a cohesive visual experience,
So that the app feels polished and on-brand.

**Acceptance Criteria:**

**Given** design tokens are configured
**When** components render
**Then** colors match PRD specifications:
  - Primary: Deep Teal #0D7377
  - Secondary/Accent: Warm Coral #FF6B6B
  - Highlight: Golden Sand #F4D03F
  - Success: Soft Green #27AE60
  - Backgrounds: Off-white, pure white cards
**And** typography uses:
  - Headings: Plus Jakarta Sans (Bold/SemiBold)
  - Body: Inter (Regular/Medium)
**And** border radius: 12-16px cards, 8px buttons, 24px pills
**And** shadows: subtle elevation for cards and buttons

### Story 16.5: Implement Physics-Based Animations

As a user,
I want smooth, delightful animations,
So that the app feels responsive and premium.

**Acceptance Criteria:**

**Given** Framer Motion is configured
**When** animations trigger
**Then** animations use spring physics (not linear timing):
  - Quick Add fly-to-trip: 150ms ease-out
  - Heart pop: 200ms bounce
  - Page transitions: 300ms ease-in-out (slide)
  - Success confetti: 500ms
**And** all animations run at 60fps
**And** AnimatePresence wraps conditional elements for exit animations
**When** user has reduced-motion preference
**Then** animations are disabled (prefers-reduced-motion media query)

### Story 16.6: Ensure WCAG 2.1 AA Accessibility

As a user with accessibility needs,
I want the app to be accessible,
So that I can use it effectively.

**Acceptance Criteria:**

**Given** accessibility standards apply
**When** components render
**Then** color contrast ratios meet WCAG 2.1 AA:
  - Primary on white: 6.2:1 ✓
  - Coral on white: 4.6:1 ✓
  - Text on backgrounds: >4.5:1
**And** all images have meaningful alt text
**And** form inputs have associated labels
**And** focus states are clearly visible (focus ring)
**And** keyboard navigation works for all interactive elements
**And** Radix UI primitives provide ARIA attributes automatically
**And** screen reader testing confirms usability

---

## Epic 17: Edge Cases & Error Handling

**Goal:** Users experience graceful handling of edge cases: empty states, network interruption, sold-out experiences, error boundaries, and consistent error messaging.

### Story 17.1: Create Empty State Components

As a user with no data,
I want to see helpful empty states,
So that I know what to do next.

**Acceptance Criteria:**

**Given** a list/screen has no data
**When** empty state renders
**Then** appropriate illustration and messaging displays:
  - Empty Trip: suitcase illustration, "Your trip canvas is empty", "Start Exploring" CTA
  - No Search Results: magnifying glass, "No experiences match '[query]'", "Try different keywords" + "Clear Filters"
  - Empty Wishlist: heart outline, "Your wishlist is empty", "Browse Experiences" CTA
  - No Bookings: calendar, "No upcoming trips", "Plan Your Adventure" CTA
  - No Filter Results: filter icon, "No experiences match these filters", "Clear Filters" button
**And** CTAs navigate to appropriate screens
**And** illustrations are lightweight SVGs

### Story 17.2: Implement Network Interruption Handling

As a user with poor connectivity,
I want the app to handle offline gracefully,
So that I don't lose my data.

**Acceptance Criteria:**

**Given** the device loses network connection
**When** a network request fails
**Then** cached data (from Spark useKV) continues to display
**And** "Last updated [timestamp]" indicator shows data freshness
**And** "Retry" button appears on failed sections
**And** toast displays "You're offline. Some features unavailable."
**When** I tap "Retry"
**Then** request attempts again
**And** success replaces error state
**When** network returns
**Then** data syncs automatically in background
**And** "Back online" toast displays

### Story 17.3: Handle Sold Out Experiences

As a traveler,
I want to know when experiences are unavailable,
So that I can find alternatives.

**Acceptance Criteria:**

**Given** an experience has no available slots (slots_available = 0 for all dates)
**When** experience card displays
**Then** "Currently Unavailable" badge overlay on image
**And** card is slightly desaturated (80% opacity)
**And** "Quick Add" button disabled
**When** I tap the card to view details
**Then** detail page shows availability calendar (all red)
**And** "Join Waitlist" button appears
**And** "Similar Experiences" section shows alternatives in same category
**When** I join waitlist
**Then** my email saved to waitlist table (experience_id, user_id, created_at)
**And** toast: "You'll be notified when spots open"

### Story 17.4: Implement Error Boundaries

As a user,
I want the app to recover from errors gracefully,
So that one bug doesn't crash everything.

**Acceptance Criteria:**

**Given** an unhandled JavaScript error occurs
**When** the error boundary catches it
**Then** friendly error UI displays instead of white screen:
  - Illustration of confused character
  - "Something went wrong"
  - "Try refreshing the page" suggestion
  - "Report Problem" link
  - "Go Home" button
**And** error details logged to console (dev mode)
**And** error reported to monitoring service (production)
**When** user taps "Go Home"
**Then** navigation resets to home screen
**And** error state clears

### Story 17.5: Create Consistent Error Messaging

As a user encountering errors,
I want clear error messages,
So that I understand what went wrong.

**Acceptance Criteria:**

**Given** various error conditions
**When** errors display
**Then** error messages are user-friendly (not technical):
  - Network: "Unable to connect. Check your internet connection."
  - Payment: "Payment couldn't be processed. Please try again."
  - Validation: "[Field] is required" (inline)
  - Not Found: "This experience is no longer available."
  - Server: "Something went wrong on our end. Please try again later."
**And** error toasts use destructive variant (red/coral)
**And** inline errors use red border and helper text
**And** all errors are recoverable (retry button or clear instructions)

---

## Epic 18: Bottom Navigation & Screen Architecture

**Goal:** Users navigate seamlessly between 5 primary sections via persistent bottom tab bar: Home/Trip, Explore, Quick Add modal, Saved/Wishlist, and Profile.

### Story 18.1: Implement Discriminated Union Screen Routing

As a developer,
I want type-safe screen routing,
So that navigation is predictable and bug-free.

**Acceptance Criteria:**

**Given** the app uses state-based routing (no react-router)
**When** Screen type is defined
**Then** discriminated union covers all screens:
```typescript
type Screen =
  | { type: 'home' }
  | { type: 'category'; categoryId: string }
  | { type: 'experience'; experienceId: string }
  | { type: 'tripBuilder' }
  | { type: 'checkout'; step: 1 | 2 | 3 | 4 }
  | { type: 'explore' }
  | { type: 'saved' }
  | { type: 'profile' }
  | { type: 'bookingHistory' }
  | { type: 'bookingDetail'; bookingId: string }
  | { type: 'settings'; section: string }
```
**And** App.tsx switches on screen.type to render correct component
**And** TypeScript ensures exhaustive handling
**And** invalid screens cause compile-time error

### Story 18.2: Build Bottom Tab Navigation Component

As a user,
I want persistent bottom navigation,
So that I can switch between main sections quickly.

**Acceptance Criteria:**

**Given** I am on any main screen
**When** bottom navigation renders
**Then** I see 5 tabs in fixed footer:
  - Home (House icon) - navigates to home screen
  - Explore (Compass icon) - navigates to explore
  - Quick Add (PlusCircle icon, larger, centered) - opens modal
  - Saved (Heart icon) - navigates to wishlist
  - Profile (User icon) - navigates to profile
**And** current tab highlighted (teal fill, label visible)
**And** other tabs show outline icons, no labels
**And** tab bar height 64px + safe area inset
**When** I tap a tab
**Then** screen changes with fade transition (150ms)
**And** scroll position resets to top

### Story 18.3: Implement Quick Add Category Modal

As a traveler,
I want quick access to categories from anywhere,
So that I can add experiences without extra navigation.

**Acceptance Criteria:**

**Given** I tap the Quick Add tab (center plus icon)
**When** the modal opens
**Then** bottom sheet slides up with category grid:
  - 6 category cards (same as home screen)
  - "Quick Add to Trip" header
  - Drag handle at top
  - Tap outside or swipe down to dismiss
**When** I tap a category
**Then** modal dismisses
**And** I navigate to that category's browse screen
**And** browse screen has "Back to Trip" in header (returns to trip builder)

### Story 18.4: Handle Deep Screens with Back Navigation

As a user navigating deep into the app,
I want back buttons to work correctly,
So that I can return to previous screens.

**Acceptance Criteria:**

**Given** I navigate deep into screens (e.g., Home → Category → Experience → Checkout)
**When** I see back button in header
**Then** tapping back returns to previous screen
**And** navigation history maintained in state array
**When** I tap bottom tab
**Then** I return to that tab's root screen (not deep screen)
**And** navigation history clears for that tab
**When** I use browser back button
**Then** behavior matches in-app back button
**And** no unexpected navigation loops

---

## Epic 19: Multi-Destination Scalability

**Goal:** Platform supports multiple destinations beyond Bali with destination-agnostic architecture, configurable per-destination settings, and extensible data structures for global expansion.

### Story 19.1: Create Destinations Data Model

As a developer,
I want a destinations table and data model,
So that the platform can support multiple locations.

**Acceptance Criteria:**

**Given** the database schema
**When** destinations table is created
**Then** table includes:
  - id (UUID, primary key)
  - name (string, e.g., "Bali")
  - slug (string, unique, e.g., "bali")
  - country (string, e.g., "Indonesia")
  - currency (string, e.g., "USD")
  - timezone (string, e.g., "Asia/Makassar")
  - language_default (string, e.g., "en")
  - description (text)
  - hero_image_url (string)
  - is_active (boolean)
  - created_at, updated_at
**And** experiences.destination_id foreign key references destinations
**And** seed data includes Bali as first destination
**And** index on slug for quick lookup

### Story 19.2: Implement Destination Selector

As a traveler,
I want to select my destination,
So that I see relevant experiences.

**Acceptance Criteria:**

**Given** multiple destinations exist
**When** I open the app
**Then** if only one active destination, auto-select it
**When** multiple destinations are active
**Then** destination selector displays in header or splash
**And** selector shows: destination cards with image, name, tagline
**When** I select a destination
**Then** user_preferences.destination_id updates
**And** all experience queries filter by destination_id
**And** home screen shows destination-specific content
**And** destination name shows in header (e.g., "Explore Bali")

### Story 19.3: Apply Per-Destination Configuration

As a traveler in different destinations,
I want the app to adapt to local settings,
So that currency and timezone are correct.

**Acceptance Criteria:**

**Given** I select a destination
**When** destination configuration applies
**Then** currency displays in destination's default (can override in settings)
**And** experience times shown in destination timezone
**And** date formats respect locale
**And** destination-specific content (guides, stories) filters correctly
**When** destination changes currency from USD to IDR
**Then** prices convert using exchange rates
**And** price formatting changes (e.g., "Rp 500,000" vs "$50")

### Story 19.4: Prepare Experience Schema for Multi-Destination

As a vendor,
I want my experiences linked to a specific destination,
So that travelers in that location can find them.

**Acceptance Criteria:**

**Given** a vendor creates an experience
**When** the creation form loads
**Then** destination is pre-selected based on vendor's location or selectable
**And** experience record includes destination_id
**And** experience only appears in browse/search when matching user's selected destination
**When** admin adds a new destination
**Then** vendors in that region can create experiences for it
**And** existing experiences remain in their original destination

### Story 19.5: Create Future Destination Teaser

As a user interested in other destinations,
I want to see upcoming destinations,
So that I know the platform is expanding.

**Acceptance Criteria:**

**Given** additional destinations are planned but not active
**When** I view destination selector or explore screen
**Then** "Coming Soon" section shows teaser cards:
  - Destination name and image (grayed or with overlay)
  - "Coming Soon" badge
  - "Notify Me" button
**When** I tap "Notify Me"
**Then** my email added to destination_waitlist table (user_id, destination_id, created_at)
**And** toast: "We'll let you know when [destination] launches!"
**And** inactive destinations don't appear in main browse

