# Phase 2b Epic Definitions

**Phase**: 2b - Enhanced Operations & Notifications
**Epics**: 29-32
**Status**: Planning
**Created**: 2026-01-11

## Overview

Phase 2b builds on the core transactional infrastructure from Phase 2a (Epics 21-28) to add:

- Enhanced vendor analytics and payout tracking
- Customer notification system (email/SMS)
- Booking modification capabilities
- Performance monitoring and observability

---

## Epic 29: Vendor Analytics & Payout Dashboard

**Goal**: Provide vendors with comprehensive analytics and real-time payout visibility.

**Stories**:

### 29-1: Create Vendor Revenue Dashboard

- Display total revenue, pending payouts, and completed payouts
- Show revenue trends over time (daily/weekly/monthly)
- Filter by experience and date range
- AC: Revenue chart with selectable time periods

### 29-2: Build Experience Performance Metrics

- Display booking count, conversion rate, and average rating per experience
- Show slot utilization percentage
- Identify top-performing experiences
- AC: Performance table with sortable columns

### 29-3: Implement Payout History Table

- Display all Stripe Connect payouts with status
- Show transfer amounts, fees, and net amounts
- Link to Stripe dashboard for details
- AC: Paginated payout history with export capability

### 29-4: Create Booking Funnel Analytics

- Track views → add-to-cart → checkout → confirmation
- Show conversion rates at each step
- Identify drop-off points
- AC: Funnel visualization with percentage drop-offs

### 29-5: Add Real-Time Revenue Notifications

- Notify vendor when booking confirmed
- Show daily/weekly revenue summaries
- Push notification support (browser notifications)
- AC: Toast notifications for new bookings

**Dependencies**: Epic 22 (Stripe Connect), Epic 27 (Vendor Operations)

---

## Epic 30: Customer Notification System

**Goal**: Keep customers informed about their bookings via email and in-app notifications.

**Stories**:

### 30-1: Create Email Notification Edge Function

- Send transactional emails via SendGrid/Resend
- Support booking confirmation, reminder, and cancellation templates
- Include PDF ticket attachment
- AC: Emails sent within 30 seconds of trigger event

### 30-2: Build Email Template System

- Create responsive HTML email templates
- Include Pulau branding and booking details
- Support multiple languages (English, Indonesian)
- AC: Templates render correctly across email clients

### 30-3: Implement Booking Reminder Scheduler

- Send reminder 24 hours before experience
- Send morning-of reminder with meeting point
- Configurable reminder timing per vendor
- AC: Scheduled jobs via Supabase pg_cron or Edge Function

### 30-4: Create In-App Notification Center

- Display notification bell with unread count
- Show notification history (booking updates, reminders)
- Mark as read/unread functionality
- AC: Notifications table with real-time updates

### 30-5: Add SMS Notification Support (Optional)

- Send SMS for critical notifications (day-of reminders)
- Use Twilio or similar provider
- Configurable per customer preference
- AC: SMS delivery with opt-in/opt-out

**Dependencies**: Epic 24 (Booking Confirmation)

---

## Epic 31: Booking Modifications & Rescheduling

**Goal**: Allow customers to modify bookings within vendor-defined policies.

**Stories**:

### 31-1: Define Modification Policy Schema

- Add modification rules to experiences (free reschedule window, fees)
- Support different policies per experience
- Store in experiences table
- AC: Migration for modification_policy JSONB column

### 31-2: Build Reschedule Request Interface

- Allow date/time change within availability
- Show availability calendar for new slot selection
- Calculate any modification fees
- AC: Reschedule modal with slot picker

### 31-3: Implement Reschedule Edge Function

- Validate against modification policy
- Release old slot, reserve new slot atomically
- Process any fee difference via Stripe
- AC: Atomic transaction with audit logging

### 31-4: Create Guest Count Modification

- Allow guest count changes (increase/decrease)
- Calculate price difference
- Process additional payment or partial refund
- AC: Guest modifier with price preview

### 31-5: Build Vendor Approval Workflow

- Notify vendor of modification requests
- Vendor approve/reject interface
- Auto-approve within free modification window
- AC: Vendor notification and action buttons

**Dependencies**: Epic 23 (Availability), Epic 28 (Refunds)

---

## Epic 32: Observability & Monitoring

**Goal**: Add production monitoring, error tracking, and performance observability.

**Stories**:

### 32-1: Integrate Error Tracking (Sentry)

- Configure Sentry for frontend errors
- Capture Edge Function errors
- Set up error alerting rules
- AC: Errors captured with stack traces and context

### 32-2: Add Application Performance Monitoring

- Track page load times and Core Web Vitals
- Monitor API response times
- Identify slow queries/functions
- AC: Performance dashboard with p50/p95 metrics

### 32-3: Create Health Check Endpoints

- Supabase connectivity check
- Stripe API health check
- Edge Function availability
- AC: /health endpoint returning system status

### 32-4: Build Admin Monitoring Dashboard

- Display system health status
- Show recent errors and alerts
- Monitor booking/revenue metrics
- AC: Admin-only dashboard with real-time updates

### 32-5: Implement Structured Logging

- Standardize log format across Edge Functions
- Add correlation IDs for request tracing
- Configure log retention and search
- AC: Searchable logs with structured fields

**Dependencies**: Epic 28 (Audit Trail)

---

## Phase 2b Summary

| Epic | Name                                 | Stories | Priority |
| ---- | ------------------------------------ | ------- | -------- |
| 29   | Vendor Analytics & Payout Dashboard  | 5       | High     |
| 30   | Customer Notification System         | 5       | High     |
| 31   | Booking Modifications & Rescheduling | 5       | Medium   |
| 32   | Observability & Monitoring           | 5       | Medium   |

**Total Stories**: 20

**Recommended Order**: 29 → 30 → 32 → 31

**Rationale**:

- Epic 29 (Analytics) builds on existing vendor infrastructure
- Epic 30 (Notifications) improves customer experience
- Epic 32 (Monitoring) should be added before more features
- Epic 31 (Modifications) is complex and can wait

---

## Future Phases (3+)

Features deferred to later phases:

- **Vendor-Customer Messaging** (real-time chat)
- **Multi-Destination Architecture** (Bali → other destinations)
- **Mobile Native App** (React Native wrapper)
- **Review & Rating System** (post-experience reviews)
- **Loyalty & Rewards Program**
- **Group Booking Support**
