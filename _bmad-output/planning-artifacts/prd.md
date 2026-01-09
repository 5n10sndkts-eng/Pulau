---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
inputDocuments:
  - "/Users/moe/Pulau/project-context.md"
  - "/Users/moe/Pulau/_bmad-output/planning-artifacts/prd/pulau-prd.md"
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 2
workflowType: 'prd'
lastStep: 0
---

# Product Requirements Document - Pulau

**Author:** Moe
**Date:** 2026-01-08

## Executive Summary

Phase 2 of Pulau transforms the platform from a "Travel Canvas" MVP into a **fully transactional marketplace**. While Phase 1 successfully validated the trip planning and discovery UX with a production-ready Supabase backend, Phase 2 focuses on closing the loop: real-time inventory, secure payments, and a trustworthy vendor ecosystem.

This phase introduces critical "trust and transaction" layer:
1.  **Transactional Integrity**: Moving from "booking requests" to authorized, paid, and confirmed reservations via Stripe.
2.  **Real-Time Reliability**: Smart inventory management that **automatically disables "Instant Book" if vendor activity data becomes stale**, protecting users from "ghost" availability.
3.  **Vendor Empowerment**: Giving operators the tools to manage their business on the go. **Critical Constraint**: "Instant Booking" relies on accurate inventory. We must deliver a "Vendor OS" mobile experience that makes digital inventory management easier than paper logs.
4.  **Social Proof**: Replacing static content with verified user reviews to drive conversion confidence.

### What Makes This Special

What differentiates Pulau Phase 2 is the **"Instant Confidence"** engine. 

Most travel platforms in this niche suffer from the "inquiry black hole"—you request a booking and wait 24 hours for a WhatsApp message. Pulau Phase 2 eliminates this anxiety. By integrating **Real-Time Availability** with **Instant Payments**, we deliver an immediate "You are going!" confirmation. 

We elevate this with **"Day-of Dependability"**:
*   **Visual Trust**: Video-first verified reviews that show the *actual* experience, not just polished marketing photos.
*   **Offline Certainty**: A Native Mobile Experience that puts the ticket and itinerary in the user's pocket, accessible without a SIM card (backed by omnichannel redundancy via SMS/Email).
*   **Live Connection**: Real-time guide status updates (with robust offline fallbacks) so you never wonder "is my driver coming?"
*   **Financial Safety**: Funds are held in escrow until trip completion, with an automated cancellation engine that eliminates refund anxiety.

This shifts user psychology from "hopeful planning" (uncertainty) to "experience ownership" (certainty).

## Project Classification

**Technical Type:** Web Application (React SPA) + Native Mobile Wrapper + Real-Time Backend
**Domain:** Travel Marketplace (Fintech + Real-time Inventory)
**Complexity:** High
**Project Context:** Brownfield - extending existing React 19 + Supabase system

### Key Technical Characteristics
*   **Real-Time Concurrency**: Highly consistent inventory management using Supabase Realtime/Postgres RLS.
*   **Financial Compliance**: Secure payment processing (Stripe/PayMoney) with handling for refunds, payouts, and multi-currency.
*   **Hybrid Client**: Maintaining a single **React/TypeScript codebase** deployed to Web, iOS, and Android (via Capacitor/Expo) to maximize velocity while delivering native trust features.

### Strategic Phasing (Risk Mitigation)
To avoid "big bang" failure, we will execute in sub-phases:
1.  **Phase 2a (Core)**: Payments, Supabase Real-time, Basic Vendor Dashboard (Web).
2.  **Phase 2b (Trust)**: Native Mobile Wrapper, Offline Mode.
3.  **Phase 2c (Growth)**: Video Reviews, Social Features.

## Success Criteria

### User Success
*   **Confidence Score**: Achieve 4.8/5 star rating on "Accuracy of Description" for verified stays/tours.
*   **Day-of Success**: 100% of "Instant Book" customers successfully access their ticket/guide without connectivity issues.
*   **Vendor Responsiveness**: 90% of vendor inquiries responded to within 1 hour (enabled by mobile app).

### Business Success
*   **Adoption Velocity**: Onboard 50 "Instant Book" ready vendors in Month 1.
*   **Inventory Integrity**: 0% double-booking rate on "Instant" inventory (enforced by penalty algorithms).
*   **Conversion Lift**: Phase 2 conversion rate (Visit → Paid Booking) > 3.0% (vs Phase 1 baseline).

### Technical Success
*   **Real-Time Latency**: Inventory counts update across all clients within < 200ms using Supabase Realtime.
*   **Offline Resilience**: 100% of "Active Trip" data available offline in Native Wrapper.
*   **Native Performance**: App launch time < 1.5s on mid-range Android devices.

### Measurable Outcomes
*   **Availability Trust**: Users stop asking "Is this available?" in chat (Goal: < 5% of pre-booking messages are availability checks).
*   **Payment Trust**: Refund disputes < 1% of total transaction volume.

## Product Scope

### MVP - Phase 2a (Core Transactional)
*   **Authentication**: Full Customer & Vendor Auth (Supabase).
*   **Payments**: Stripe Connect integration (Escrow, Payouts, Refunds).
*   **Real-Time**: Inventory decrementing with Concurrency Control.
*   **Vendor Web Portal**: Basic inventory & booking management.

### Growth - Phase 2b (Native Trust)
*   **Mobile Wrapper**: Capacitor/RN integration for iOS/Android shell.
*   **Offline Engine**: Local database sync for tickets/itinerary.
*   **Push Notifications**: "Guide Arrived", "Trip Starting" alerts.

### Vision (Future)
*   **Video Ecosystem**: TikTok-style reviews and verified vendor tours.
*   **Multi-Destination**: Expansion beyond Bali.

## User Journeys

### Journey 1: Sam's Spontaneous "Ticket in Pocket"
Sam is in Uluwatu with spotty 5G. It's 4 PM and he wants to catch the 6 PM Kecak Dance.
*   **Action**: Opens Pulau App (Native Wrapper). Filters by "Instant Book". Sees "Uluwatu Temple Ticket - 5 spots left".
*   **Transaction**: Taps "Book Now". Apple Pay sheet slides up. Auth success.
*   **Result**: Ticket QR code downloads *instantly* to local storage.
*   **Validation**: Arrives at gate. Network dies. Opens app. Ticket loads from cache. Scans successfully.

### Journey 2: Pak Wayan's "Pocket Office"
Wayan runs a snorkeling boat. He's out at sea.
*   **Action**: Notification buzzes on his Android phone: "New Booking for Tomorrow - 2 Pax".
*   **Transaction**: He taps "Confirm" (even though it was auto-accepted, he acknowledges).
*   **Availability**: His boat for tomorrow shows "8/10 seats full". He gets a walk-up customer on the beach. He opens the app and manually adds "2 Walk-ins".
*   **Result**: Inventory updates to "10/10 Full". The web platform instantly shows "Sold Out" to prevent double-booking.

### Journey 3: Support Agent "The Dispute"
User claims "Guide never showed up". Vendor claims "I was there".
*   **Action**: Support Agent opens "Dispute Dashboard".
*   **Evidence**: Pulls "Guide Location Log" (from Vendor App GPS check-in). Sees Vendor was at the hotel lobby. Pulls "User Chat Log".
*   **Result**: Identifies User was at the wrong lobby.
*   **Resolution**: Issues partial refund (policy flexibility) but marks Vendor as "Correct". Funds released to Vendor.

### Journey Requirements Summary
*   **User App**: Offline Storage (LocalDB), Apple/Google Pay Integration.
*   **Vendor App**: Inventory Quick-Edit, Push Notifications, GPS Check-in (for disputes).
*   **Admin Console**: Dispute Resolution View, Evidence Logs (Chat/GPS).

## Domain-Specific Requirements

### Fintech Marketplace Compliance & Regulatory Overview
As a two-sided marketplace processing payments and payouts, Pulau operates under **Fintech** constraints. We mitigate liability by leveraging **Stripe Connect** as the "Merchant of Record" where possible, but we retain responsibility for inventory truth and dispute arbitration.

### Key Domain Concerns
*   **KYC (Know Your Customer)**: Mandatory identity verification for all Vendors before payouts are enabled.
*   **PCI DSS**: Total offload of sensitive card data to Stripe Elements (SAQ A compliance level).
*   **Fraud Prevention**: High risk of "Friendly Fraud" (chargebacks) and "Fake Vendor" listings.
*   **Auditability**: Complete audit trail required for every transaction state change to resolve disputes.

### Compliance Requirements
*   **Vendor Onboarding**: Must complete Stripe Connect Express flow (Identity + Bank verification) before "Publishing" any experience.
*   **Data Residency**: User data stored in Supabase (Cloud), but payment data remains in Stripe vaults.
*   **Refund Policy**: Must be displayed clearly at checkout. System must enforce the policy automatically (no manual vendor calculation).

### Industry Standards & Best Practices
*   **Escrow Payouts**: Funds are held (T+7 or T+30) to cover potential disputes before release to vendor.
*   **Idempotency**: All payment API calls must support idempotency keys to prevent double-charges on network failure.
*   **3D Secure**: Enforce 3DS for all transactions to shift liability for chargebacks.

### Required Expertise & Validation
*   **Stripe Connect Architect**: Need expertise in "Destination Charges" vs "Separate Charges and Transfers".
*   **Legal**: Terms of Service must explicitly state Pulau is a "Platform" connecting users and vendors, limiting liability for service delivery.

### Implementation Considerations
*   **Compliance Matrix**:
    *   Vendor Identity Verified? -> Enable Payouts.
    *   Vendor Bank Linked? -> Enable Instant Book.
    *   Vendor Terms Accepted? -> Enable Listing.
*   **Audit Logging**:
    *   `audit_logs` table in Supabase is mandatory. Tracks: `booking_id`, `actor_id`, `action`, `timestamp`, `metadata`.
    *   Store raw Stripe Webhook IDs for reconciliation.

## Innovation & Novel Patterns

### Detected Innovation Areas
*   **The "Instant Confidence" Engine**: A novel synthesis of real-time inventory (Supabase), financial escrow (Stripe), and offline auditing (Native) to bring enterprise-grade trust to the informal travel sector.
*   **Vendor OS**: Re-imagining the "Admin Dashboard" not as a desk tool, but as a "Pocket Command Center" that works intermittently at sea or in the jungle.

### Market Context & Competitive Landscape
*   **Competitors**: Experience platforms (Viator/Klook) rely on "24h confirm" for small vendors. WhatsApp booking is instant but insecure.
*   **Differentiation**: Pulau bridges the gap—offering the speed of WhatsApp with the security of Klook.

### Validation Approach
*   **The "No-Signal" Test**: Can a user redeem a ticket and a vendor validate it with ZERO connectivity?
*   **The "Double-Book" Stress Test**: Simulate high-concurrency bookings (100 in 1s) to prove inventory lock reliability.

### Risk Mitigation
*   **Adoption Risk**: If vendors don't trust the app, they won't open it.
*   **Mitigation**: "Concierge Onboarding" giving them a pre-configured device or hands-on setup.

## Hybrid Web/Mobile Requirements

### Project-Type Overview
Pulau Phase 2 is a **Hybrid Monorepo** where the core is a React Web application wrapped in a Native Shell (Capacitor) for iOS/Android distribution. This allows 95% code reuse while accessing critical native device features.

### Technical Architecture Considerations
*   **Offline First Engine**: We will implement **WatermelonDB** (or RxDB) to maintain a local replica of the `bookings` and `tickets` tables. This ensures the "Ticket in Pocket" works in airplane mode.
    *   *Constraint*: Must handle conflict resolution if a Vendor edits a booking offline while a User cancels online (Last-Write-Wins favored for Vendor).
*   **Native Bridge (Inter-process Communication)**:
    *   **Camera**: Used for Vendor-side Ticket Scanning (QR Code).
    *   **Geolocation**: Background GPS tracking for "Live Guide Status".
    *   **Biometrics**: FaceID/TouchID for secure Vendor Login.
*   **Push Notification Strategy**:
    *   **OneSignal** integrated with Supabase Edge Functions.
    *   *Trigger*: `bookings` table INSERT -> Edge Function -> OneSignal API -> User Device.

### Implementation Considerations
*   **Deep Linking**: App must handle `pulau://booking/{id}` links from email confirmations.
*   **Store Compliance**: Apple App Store rules require "Sign in with Apple" if we offer Google/Meta login. We must implement this.
*   **OTA Updates**: We will use **Capacitor Live Updates** (or similar) to patch the JS bundle without full App Store review for hotfixes.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy
**MVP Approach:** **Problem-Solving MVP (Web First)**.
We prioritize the **Transactional Core** (Stripe/Real-time) on the Web Platform first. We mitigate the "Offline Trust" gap via **PWA Service Worker Caching** and Email/SMS redundancy in Phase 2a, delaying the full Native Wrapper complexity to Phase 2b.
**Resource Requirements:** 1 Full-Stack (User) + AI Agents.

### MVP Feature Set (Phase 2a)
**Core User Journeys Supported:**
*   Journey 2 (Pak Wayan): Vendor Inventory Management.
*   Journey 3 (Support): Dispute Resolution.
*   *Partial* Journey 1 (Sam): User books instantly (mobile web) and relies on PWA Cache + Email PDF for offline ticket.

**Must-Have Capabilities:**
*   **Stripe Connect**: Onboarding + Payment Processing (Split Funds).
*   **Supabase Realtime**: Booking state sync.
*   **Vendor PWA**: Mobile-responsive dashboard with Service Worker caching.
*   **Email Engine**: Reliable receipt/ticket delivery (Postmark/Resend).

### Post-MVP Features (Phase 2b & 2c)
**Phase 2b (Trust Layer):**
*   **Native Wrapper (Capacitor)**: iOS/Android Store release.
*   **WatermelonDB**: True Offline Sync (SQL-level).
*   **Push Notifications**.

**Phase 2c (Growth):**
*   **Video Reviews**.
*   **Social Feed**.

### Risk Mitigation Strategy
*   **Technical Risks (Hybrid Complexity)**: Deferred by splitting Web (2a) and Native (2b). Allows data model stability before syncing to devices.
*   **Market Risks (Trust)**: Mitigated by "Omnichannel Redundancy" (SMS/Email) + PWA Cache in 2a.

## Functional Requirements

### Vendor Onboarding & Identity
*   FR-VEN-01: Vendor can register via "Stripe Express" flow, completing KYC and Bank Account linkage.
*   FR-VEN-02: Vendor can define "Instant Book" vs "Request" policies per experience.
*   FR-VEN-03: Vendor can set "Cut-off Times" (e.g., stop booking 2 hours before start).

### Traveler Booking & Payment
*   FR-BOOK-01: Traveler can filter search results by "Instant Confirmation".
*   FR-BOOK-02: Traveler can view real-time slot availability (e.g., "5 spots left at 10:00 AM").
*   FR-BOOK-03: Traveler can pay via Credit Card or Apple/Google Pay (Stripe Elements).
*   FR-BOOK-04: Traveler receives an immediate PDF Ticket via Email upon payment success.

### Offline Trust (Web/PWA)
*   FR-OFF-01: Traveler can access their "Active Ticket" page without network connectivity (served via Service Worker Cache).
*   FR-OFF-02: Traveler sees a "Last Updated" timestamp on their offline ticket to indicate data freshness.

### Vendor Pocket Operations
*   FR-OPS-01: Vendor receives Push/SMS notification immediately upon new booking.
*   FR-OPS-02: Vendor can "Check-in" a traveler by scanning a QR code (using device camera via PWA wrapper).
*   FR-OPS-03: Vendor can manually block/unblock inventory slots for walk-in customers.

### Financial Admin & Disputes
*   FR-ADM-01: Admin can search bookings by Booking ID, Vendor Name, or Traveler Email.
*   FR-ADM-02: Admin can initiate a partial or full refund via the Dashboard.
*   FR-ADM-03: Admin can view an immutable "Audit Log" of all status changes for a specific booking.

## Non-Functional Requirements

### Performance
*   **Real-Time Latency**: Inventory availability updates must propagate to all connected clients within **500ms** (99th percentile) via Supabase Realtime to prevent "phantom availability".
*   **PWA Interactive Time**: The "Active Ticket" page must reach TTI (Time to Interactive) in **< 1.5 seconds** on a 4G connection.

### Reliability & Offline
*   **Offline Ticket Access**: Downloaded ticket data (QR code, metadata) must remain accessible via PWA Cache/LocalDB for **30 days** without network renewal.
*   **Sync Recovery**: The application must automatically attempt to reconcile booking state within **10 seconds** of network restoration.

### Security & Compliance
*   **PCI DSS Scope**: The application must NEVER process or store raw PAN (Primary Account Number) data. All card entry must occur within Stripe Elements iframes (SAQ-A).
*   **Audit Immutability**: Critical actions (Booking Confirmation, Cancellation, Refund) must generate an immutable audit log entry retained for **7 years** for tax/legal compliance.

### Concurrency
*   **Overbooking Protection**: The database must support row-level locking or atomic transactions to handle **10 concurrent booking attempts** for a single slot, ensuring exactly zero overbookings.
