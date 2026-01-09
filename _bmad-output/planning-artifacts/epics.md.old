---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ['pulau-prd.md', 'architecture.md', 'project-context.md']
---

# Pulau - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Pulau, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Visual itinerary builder where travelers add experiences to a calendar-style trip view.
FR2: Browse categorized local experiences with smart filtering and search.
FR3: Multimedia experience detail pages with pricing calculator and operator bio.
FR4: 4-step guided checkout process (Review → Traveler Details → Payment → Confirmation).
FR5: 3-screen onboarding preference capture for personalized recommendations.
FR6: Booking history dashboard (Upcoming/Past) with "Book Again" (trip duplication) functionality.
FR7: Real-time total cost calculation across building and checkout phases.
FR8: Scheduling conflict detection with yellow warning banners and adjustment suggestions.
FR9: Graceful handling of empty states (no results, no trips, no wishlist items).
FR10: Network interruption handling with local caching and retry mechanisms.
FR11: Support for browsing and adding to trip without committing to dates initially.
FR12: Form validation for checkout with highlighted errors and saved progress.
FR13: Display of sold-out experiences with badges, waitlist, and alternative suggestions.
FR14: Primary data persistence via GitHub Spark KV store with native @github/spark SDK.

### NonFunctional Requirements

NFR1: Performance - Instant filter updates (<100ms) and <10 min trip building flow.
NFR2: Offline Resilience - Local data persistence via Spark KV with cached data support.
NFR3: Mobile-First - 44x44px touch targets and responsive breakpoints (640px/768px/1024px).
NFR4: Accessibility - WCAG 2.1 AA color contrast, semantic HTML, and Radix UI primitives.
NFR5: Animation - Physics-based transitions (150-500ms) with reduced-motion support.
NFR6: Security - Browser-native SubtleCrypto PBKDF2 for client-side password hashing.
NFR7: State Management - Global state sync via KV keys (`pulau_trips`, `pulau_bookings`).
NFR8: Design - Bali-inspired palette (Teal/Coral/Golden/Sand) with editorial quality.

### Additional Requirements

- **Starter Template**: Project initialized via GitHub Spark Template. Epic 1 Story 1 should reflect setup/validation of this environment.
- **Tech Stack**: React 19, TypeScript 5.7.2, Vite 6, Tailwind CSS 4 Alpha.
- **UI Framework**: shadcn/ui (Radix) with Lucide React icons.
- **Persistence Rule**: Use `useKV` hook exclusively; no relational DB or SQL terminology should remain in implementation stories.
- **Mocking**: Email verification and external integrations must be mocked using console/Toast as Spark is client-side.

### FR Coverage Map

FR1: Epic 4 - Visual Trip Canvas
FR2: Epic 3 - Experience Discovery
FR3: Epic 3 - Detailed Pages
FR4: Epic 6 - Multi-Step Checkout
FR5: Epic 2 - Onboarding
FR6: Epic 7 - Booking Dashboard
FR7: Epic 4 - Live Price Calculation
FR8: Epic 5 - Conflict Detection
FR9: Epic 3 - Empty States
FR10: Epic 7 - Network Interruption/Persistence
FR11: Epic 4 - Date Not Set Flow
FR12: Epic 6 - Form Validation
FR13: Epic 3 - Sold Out Handling
FR14: Epic 1 - KV Persistence

## Epic List

### Epic 1: Foundation & Bali-Inspired Design System
Establish the technical core and UI framework using GitHub Spark, React 19, and the Bali-inspired design tokens.
**FRs covered:** FR14, NRF1-NFR8

**Goal:** Establish the technical core and UI framework using GitHub Spark, React 19, and the Bali-inspired design tokens.

### Story 1.1: Initialize GitHub Spark Environment & TypeScript

As a developer,
I want the GitHub Spark environment initialized with React 19 and TypeScript strict mode,
So that I have a stable and type-safe foundation for building the application.

**Acceptance Criteria:**

**Given** the GitHub Spark project directory
**When** I list the dependencies and configuration
**Then** I see React 19, TypeScript 5.7+ with strict mode enabled, and the @github-spark SDK installed
**And** the project structure includes a `src/` directory with a standard entry point (App.tsx)
**And** path aliases (`@/*`) are configured for clean imports

### Story 1.2: Configure Bali-Inspired Tailwind Design System

As a UI developer,
I want the Tailwind CSS configuration to include the custom Bali-inspired color palette and typography,
So that I can easily apply consistent branding across all components.

**Acceptance Criteria:**

**Given** the initialized project
**When** I check the Tailwind configuration
**Then** I see the custom colors defined: Deep Teal (#0D7377), Warm Coral (#FF6B6B), Golden Sand (#F4D03F), and Soft Green (#27AE60)
**And** the font family includes Plus Jakarta Sans for headers and Inter for body text
**And** the theme specifies the custom typographic hierarchy (Large Title 32px, Section Titles 24px, etc.)
**And** the spacing system is set with a 4px base unit

### Story 1.3: Set Up Component Architecture with Radix & Lucide Icons

As a developer,
I want Radix UI primitives and Lucide React icons available in the project,
So that I can build accessible components with high-quality, recognizable iconography.

**Acceptance Criteria:**

**Given** the Tailwind-configured project
**When** I attempt to use a Radix primitive (like Dialog or Sheet)
**Then** the component renders correctly with appropriate accessibility ARIA attributes
**And** I can import and render Lucide React icons (Home, Compass, etc.) with consistent styling (2px stroke)
**And** the `shadcn/ui` utility structure for components is initialized in `src/components/ui`

### Story 1.4: Implement Physics-Based Animation System (Framer Motion)

As a designer,
I want physics-based animations and transitions configured via Framer Motion,
So that the application feels fluid, responsive, and delightful to use.

**Acceptance Criteria:**

**Given** a user interaction requiring motion (e.g., adding an item to trip)
**When** the animation occurs
**Then** it follows the specified durations (150ms-500ms) and uses physics-based spring easings
**And** the system honors `prefers-reduced-motion` media queries to minimize motion for sensitive users
**And** entrance/exit animations are handled using `AnimatePresence` for route or modal changes

### Story 1.5: Establish Global Layout & Spark Navigation Shell

As a traveler,
I want a consistent global layout with a bottom navigation bar,
So that I can easily move between different sections of the app (Home, Explore, Saved, Profile).

**Acceptance Criteria:**

**Given** any screen in the application
**When** I look at the bottom of the screen
**Then** I see a persistent navigation bar with 5 primary sections: Home/Trip, Explore, Quick Add (Plus), Saved, and Profile
**And** the navigation bar height is exactly 64px with appropriate safe area insets for mobile
**And** the active section is highlighted using the Primary Teal color
**And** the layout contains a main content area that handles responsive margins (20px horizontal)

### Epic 2: Onboarding & Personalization Engine

**Goal:** Capture traveler preferences and guide initial setup to tailor the experience discovery journey.

### Story 2.1: Implement Customer Registration Flow

As a traveler,
I want to create an account with email and password,
So that I can save my trips and preferences into my personal Spark KV space.

**Acceptance Criteria:**

**Given** I am on the registration screen 
**When** I enter valid email and a password (min 8 chars)
**Then** my password is hashed using PBKDF2 (SubtleCrypto) with 100,000 iterations and a unique salt
**And** the user record (id, email, hashed password, salt) is saved to the Spark KV store
**And** I am automatically logged in and redirected to the onboarding screen
**And** duplicate email registration is blocked with a "Email already in use" message

### Story 2.2: Create Onboarding Screen 1: Travel Style Picker

As a new traveler,
I want to select my preferred travel styles (e.g., Adventure, Relaxed, Cultural),
So that the app can suggest experiences that match my interests.

**Acceptance Criteria:**

**Given** I am on the first onboarding screen
**When** I see a list of travel style options with Bali-inspired icons
**Then** I can select one or more categories that interest me
**And** the "Next" button becomes enabled once at least one selection is made
**And** my selections are temporarily stored in local state

### Story 2.3: Create Onboarding Screen 2: Group Type Selection

As a traveler,
I want to specify who I am traveling with (e.g., Solo, Couple, Family, Group),
So that the service can recommend activities suitable for my group size.

**Acceptance Criteria:**

**Given** I have completed the travel style selection
**When** I am presented with group type options (Solo, Couple, Family, Group)
**Then** I can select exactly one option that represents my travel party
**And** I can navigate back to the previous screen to change my travel styles
**And** the selection is added to my local onboarding state

### Story 2.4: Create Onboarding Screen 3: Budget & Initial Dates

As a traveler,
I want to set my budget level and optional trip dates,
So that I can see recommendations that fit my financial plan and availability.

**Acceptance Criteria:**

**Given** I have specified my group type
**When** I am on the final onboarding screen
**Then** I can select a budget level (Value, Balanced, Luxury)
**And** I can optionally select a start and end date for my trip using a Radix-based date picker
**And** I can click "Complete" to finish the onboarding process
**And** selecting "Skip for now" on dates allows me to proceed without a fixed schedule

### Story 2.5: Implement Onboarding State Persistence (Spark KV)

As a user,
I want my onboarding preferences to be saved permanently,
So that I don't have to repeat the setup process when I return to the app.

**Acceptance Criteria:**

**Given** I have clicked "Complete" on the final onboarding screen
**When** the system processes my inputs
**Then** my preferences (styles, group type, budget, dates) are saved to the `user_preferences` namespace in the Spark KV store
**And** the system sets a flag indicating onboarding is complete
**And** I am automatically redirected to the Home screen

### Story 2.6: Build "Perfect for You" Recommendation Logic

As a traveler,
I want to see personalized recommendations on the Home screen,
So that I can quickly find the most relevant Bali experiences.

**Acceptance Criteria:**

**Given** I am on the Home screen after onboarding
**When** the app loads available experiences
**Then** a "Perfect for You" section displays at the top
**And** items in this section are filtered/ordered based on the styles and budget I selected during onboarding
**And** if no preferences are found (guest mode), it shows broad "Popular in Bali" recommendations instead

### Epic 3: Experience Discovery & Detailed Insights

**Goal:** Enable travelers to browse, search, and deep-dive into authentic local experiences with high confidence.

### Story 3.1: Create Experience Listing Page with Search & Filters

As a traveler,
I want to browse experiences by category and apply filters,
So that I can find activities that match my specific needs and Bali travel style.

**Acceptance Criteria:**

**Given** I am on the "Explore" screen
**When** I enter a search term or select a category chip (e.g., Water, Land, Culture)
**Then** the display grid updates instantly (<100ms) with matching results
**And** I can apply additional filters for difficulty, duration, and price range
**And** a "Quick Add" button is available on each card to add the item directly to my trip canvas
**And** the UI shows a skeleton loading state while data is being fetched from the Spark KV store

### Story 3.2: Implement Detailed Experience View (Carousel & Description)

As a traveler,
I want to see rich details and high-quality images of an experience,
So that I can make an informed decision about whether to add it to my trip.

**Acceptance Criteria:**

**Given** I have tapped on an experience card
**When** the detail page loads
**Then** I see a high-resolution image carousel with dot indicators
**And** the page includes a detailed description, "What's Included" list, and "What to Bring" section
**And** the layout is mobile-optimized with a sticky "Add to Trip" bar at the bottom
**And** I can share the experience using the native browser share API

### Story 3.3: Build Operator Profile & Review Components

As a cautious traveler,
I want to see information about the local operator and reviews from other travelers,
So that I can feel confident about the quality and authenticity of the experience.

**Acceptance Criteria:**

**Given** I am on the experience detail page
**When** I scroll to the bottom
**Then** I see an "About the Host" section with the operator's name, photo, and years of experience
**And** a list of verified reviews displays with star ratings and travel dates
**And** users can mark reviews as "Helpful"
**And** if there are no reviews yet, a friendly "Be the first to review" message appears

### Story 3.4: Implement Pricing Calculator (Guest Count & Live Total)

As a traveler,
I want to adjust the number of participants and see a live price calculation,
So that I know exactly how much the experience will cost for my group.

**Acceptance Criteria:**

**Given** I am on the experience detail page
**When** I increase or decrease the guest count using the stepper widget
**Then** the total price updates immediately based on the per-person rate
**And** if the guest count exceeds the operator's max capacity, a warning is shown
**And** the "Add to Trip" button reflects the updated total price

### Story 3.5: Handle "Sold Out" and "No Results" Global States

As a user,
I want clear feedback when an item is unavailable or no results match my filters,
So that I don't waste time trying to book unavailable activities.

**Acceptance Criteria:**

**Given** I am browsing experiences
**When** an item has no remaining availability for the current season
**Then** a "Currently Unavailable" badge displays on the card and detail page
**And** the "Add to Trip" button is disabled
**And** if my search filters return zero results, a friendly empty-state illustration appears with a "Clear Filters" CTA

### Epic 4: Visual Trip Canvas & Real-time Itinerary

**Goal:** Provide an interactive workspace for composing vacations with immediate feedback on schedule and cost.

### Story 4.1: Build Interactive Trip Timeline View

As a traveler,
I want a visual timeline of my trip organized by day,
So that I can see the structure of my vacation at a glance.

**Acceptance Criteria:**

**Given** I have added experiences to my trip
**When** I view the "Trip" screen
**Then** I see a vertical timeline with connecting lines between day headers
**And** each day displays the experiences assigned to it in chronological order
**And** I can toggle between "Calendar" and "List" views of my itinerary
**And** the timeline is responsive, showing a simplified view on mobile devices

### Story 4.2: Implement "Quick Add" Animation & Logic

As a traveler,
I want a visual confirmation when I add an item to my trip,
So that I feel immediate progress in my vacation planning.

**Acceptance Criteria:**

**Given** I am on the experience discovery screen
**When** I tap the "Quick Add" (+) button on an experience card
**Then** the card or a representative element animates smoothly (150ms ease-out) towards the trip navigation icon
**And** the trip icon shows a brief bounce or highlight to confirm receipt
**And** the trip count badge increments by one
**And** a toast notification appears saying "[Experience Name] added to your trip"

### Story 4.3: Build Real-Time Trip Cost Summary Widget

As a budget-conscious traveler,
I want to see the total cost of my trip update as I add or remove items,
So that I can stay within my financial target during the planning process.

**Acceptance Criteria:**

**Given** I am building my trip itinerary
**When** I add or remove an experience
**Then** the cumulative total cost updates immediately in the persistent trip bar/header
**And** the total cost is calculated by summing the (price * guests) for every item in the current trip plan
**And** I can see a breakdown of costs by clicking on the total amount

### Story 4.4: Support Floating Itinerary Persistence (Spark KV)

As a user,
I want my trip progress to be saved automatically,
So that I don't lose my work if I close the browser or refresh the page.

**Acceptance Criteria:**

**Given** I have modified my trip canvas (added/removed/reordered items)
**When** a change occurs
**Then** the updated trip array is saved to the `pulau_trips` KV key in the Spark KV store
**And** the system provides a subtle "Saved" indicator when persistence is successful
**And** when I reopen the app, my previous trip state is restored exactly as I left it

### Story 4.5: Implement Date-less Planning Flow

As a traveler who hasn't decided on exact dates,
I want to add experiences to my trip without assigning them to specific days,
So that I can build a "bucket list" before finalizing my schedule.

**Acceptance Criteria:**

**Given** I haven't set trip start/end dates
**When** I add an experience to my trip
**Then** it is placed in a "To Be Scheduled" or "Floating Items" section of the trip canvas
**And** the system prompts me with a friendly message to "Set dates to organize your timeline" when I have 3+ floating items
**And** I can drag-and-drop these items onto specific days once dates are eventually set

### Epic 5: Intelligent Scheduling & Conflict Detection

**Goal:** Ensure itinerary feasibility with automatic overlap detection and smart resolution suggestions.

### Story 5.1: Implement Time Overlap Detection Logic

As a developer,
I want a robust algorithm to detect overlapping experiences within a trip day,
So that users can be alerted to scheduling conflicts automatically.

**Acceptance Criteria:**

**Given** two or more experiences added to the same trip day
**When** their time ranges (start time to end time) overlap
**Then** the system identifies the conflict
**And** the conflict detection logic accounts for experience durations
**And** the logic is implemented as a reusable utility function with comprehensive test coverage

### Story 5.2: Create Conflict Warning Banner UI

As a traveler,
I want a clear visual warning when I have a scheduling conflict,
So that I can address it before finalizing my trip.

**Acceptance Criteria:**

**Given** a scheduling conflict has been detected in my itinerary
**When** I view the "Trip" screen or the timeline
**Then** a Bali-inspired "Yellow Warning" banner appears at the top of the day with the conflict
**And** the banner identifies the specific experiences that are overlapping
**And** the experiences themselves are highlighted with a subtle warning border

### Story 5.3: Build "Conflict Resolution" Suggestion Dialog

As a traveler,
I want suggestions on how to fix my scheduling conflicts,
So that I can resolve issues with minimal effort.

**Acceptance Criteria:**

**Given** I have a scheduling conflict
**When** I tap on the warning banner or a conflicted item
**Then** a dialog appears presenting resolution options: "Move to Another Day", "Remove Item", or "Adjust Time"
**And** the dialog facilitates these actions directly (e.g., providing a date picker for "Move")
**And** upon resolution, the warning state is cleared from the UI

### Story 5.4: Implement Time Buffer Recommendations

As a developer,
I want the system to suggest travel time buffers between experiences,
So that the user's itinerary remains realistic and relaxed.

**Acceptance Criteria:**

**Given** two experiences scheduled back-to-back on the same day
**When** the gap between them is less than 30 minutes
**Then** a subtle "Relaxation Tip" or "Travel Time Suggestion" appears
**And** it recommends increasing the buffer for a better experience
**And** the suggestion is non-blocking (doesn't prevent checkout) but highly visible

### Story 5.5: Sync Conflict States to Persistent Trip Record

As a user,
I want my conflict alerts to be remembered across sessions,
So that I don't forget to fix them if I close the app.

**Acceptance Criteria:**

**Given** a trip with resolved or unresolved conflicts
**When** the trip state is saved to the Spark KV store (`pulau_trips`)
**Then** the conflict metadata (status, associated items) is included in the persistence object
**And** when I reload the app, the same warnings or resolution states are restored

### Epic 6: Multi-Step Checkout & Persistence

**Goal:** Guide users through a secure, persistent booking flow to convert plans into travel realities.

### Story 6.1: Build Checkout Step 1: Trip Review & Confirmation

As a traveler,
I want to review my final itinerary and total cost before paying,
So that I can ensure all dates and activities are correct.

**Acceptance Criteria:**

**Given** I have a trip canvas with at least one experience
**When** I initiate the checkout process
**Then** I am presented with a "Review Trip" screen
**And** the screen shows a chronological summary of all experiences, guest counts, and individual prices
**And** the grand total is prominently displayed at the bottom
**And** I can navigate back to the trip canvas if I need to make changes

### Story 6.2: Create Checkout Step 2: Traveler Information Form

As a traveler,
I want to enter my contact and travel details,
So that the operator knows who is attending the experience.

**Acceptance Criteria:**

**Given** I have reviewed my trip summary
**When** I proceed to the next checkout step
**Then** I see a form for "Primary Traveler Information" (Full Name, Email, Phone Number)
**And** the form validates inputs in real-time (valid email format, required fields)
**And** error states are highlighted using the design system's destructive color
**And** the "Next" button is only active when all required fields are valid

### Story 6.3: Implement Checkout Step 3: Payment Method Selection

As a traveler,
I want to select my payment method and provide billing info securely,
So that I can complete my booking with confidence.

**Acceptance Criteria:**

**Given** I have entered my traveler details
**When** I reach the payment step
**Then** I can choose between simulated payment methods (e.g., Credit Card, Digital Wallet)
**And** I can enter billing details (name on card, country)
**And** the payment process is mocked with a "Processing" state and follows GitHub Spark's client-side security guidelines
**And** no full credit card numbers are stored in plain text in the KV store

### Story 6.4: Build Checkout Step 4: Success Animation & Reference Receipt

As a traveler,
I want a clear and celebratory confirmation of my booking,
So that I feel excited and assured that my Bali experience is reserved.

**Acceptance Criteria:**

**Given** the payment has been processed successfully
**When** I am redirected to the success screen
**Then** I see a high-quality physics-based success animation (e.g., celebratory confetti)
**And** a unique "Booking Reference ID" (8-character alphanumeric) is generated and displayed
**And** I can copy the reference ID to my clipboard with a single tap
**And** a summary of the booking stays visible for my reference

### Story 6.5: Persist Confirmed Booking to global `pulau_bookings` (KV)

As a user,
I want my bookings to be permanently recorded and my planning canvas cleared,
So that I can manage my travel history without cluttering my workspace.

**Acceptance Criteria:**

**Given** a successful checkout completion
**When** the system finalizes the record
**Then** the trip object is transformed into a Booking object and saved to the `pulau_bookings` KV namespace
**And** the active `pulau_trips` KV key for this user is cleared
**And** the booking record includes the timestamp, total price, traveler info, and the list of experiences

### Epic 7: Trip Management & Rebooking Dashboard

**Goal:** Provide post-booking visibility and the ability to find and duplicate past travel history effortlessly.

### Story 7.1: Build "My Trips" Dashboard with Tabs (Upcoming/Past)

As a traveler,
I want a central dashboard to see all my bookings,
So that I can easily keep track of my upcoming adventures and past memories.

**Acceptance Criteria:**

**Given** I have multiple bookings (both in the future and in the past)
**When** I navigate to the "Profile" > "My Trips" screen
**Then** I see a tabbed interface with "Upcoming" and "Past" views
**And** the "Upcoming" tab shows currently active/future bookings ordered by start date
**And** the "Past" tab shows my travel history
**And** each trip card displays the summary photo, date range, and booking status

### Story 7.2: Create Read-Only Booking Detail View

As a traveler,
I want to see the full details of a specific confirmed booking,
So that I can access my reference numbers and itinerary when I'm on the ground in Bali.

**Acceptance Criteria:**

**Given** I am on the "My Trips" dashboard
**When** I tap on a specific trip card
**Then** I am presented with a read-only view of the full itinerary
**And** the view displays the 8-character "Booking Reference ID" prominently
**And** I can see the total price paid and all experience details identical to the planning view
**And** a link to "Contact Support" is available for active bookings

### Story 7.3: Implement "Book Again" (Trip Duplication) Flow

As a traveler who loved my previous trip,
I want to duplicate a past booking into a new planning canvas,
So that I can easily plan a similar vacation for future dates.

**Acceptance Criteria:**

**Given** I am viewing a past booking in the detail view
**When** I tap the "Book Again" button
**Then** the items from that booking are copied into my active `pulau_trips` canvas
**And** I am redirected to the "Trip Canvas" screen
**And** the dates are cleared, allowing me to set new dates for the duplicated items
**And** any experiences that are no longer available are flagged with a warning

### Story 7.4: Build Global Loading & Network Resilience Overlay

As a user on a potentially unstable local network,
I want to know if my trip data is synced and see retry options if a fetch fails,
So that I can trust my data is safe.

**Acceptance Criteria:**

**Given** I am interacting with features that require Spark KV access
**When** a network interruption occurs or data is being fetched
**Then** a subtle global loading indicator or "Syncing..." status appears
**And** if a persistent error occurs, a "Retry" button is presented to the user
**And** the UI displays a "Last synced 2 minutes ago" timestamp to establish trust

### Story 7.5: Implement Trip Deletion & Item Removal with Confirmation

As a traveler,
I want to be able to remove items or bookings I no longer need,
So that I can keep my travel dashboard organized.

**Acceptance Criteria:**

**Given** I am on the "Trip Canvas" or "My Trips" screen
**When** I attempt to delete a trip or remove an item
**Then** a confirmation dialog appears to prevent accidental deletions
**And** upon confirmation, the record is removed from the respective KV namespace
**And** a "Deleted Successfully" toast notification appears with a brief countdown
