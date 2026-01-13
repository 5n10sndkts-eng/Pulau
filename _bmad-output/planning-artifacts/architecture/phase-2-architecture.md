---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: ['prd.md', 'architecture.md', 'project-context.md']
workflowType: 'architecture'
project_name: 'Pulau'
user_name: 'Moe'
date: '2026-01-09'
lastStep: 5
status: 'in_progress'
extends: 'architecture.md'
phase: '2a-core'
---

# Phase 2 Architecture Decision Document

_This document extends the Phase 1 architecture for Phase 2 "Transactional Marketplace" capabilities. Phase 1 architecture decisions remain in effect unless explicitly superseded here._

---

## Executive Summary

Phase 2 transforms Pulau from a "Travel Canvas" MVP with mock data into a **fully transactional marketplace**. This architecture document addresses the critical new capabilities:

1. **Payment Processing** - Stripe Connect for escrow, payouts, refunds
2. **Real-Time Inventory** - Supabase Realtime for concurrency control
3. **Native Mobile Wrapper** - Capacitor/Expo for iOS/Android (Phase 2b)
4. **Offline Sync Engine** - Local database for offline ticket access (Phase 2b)
5. **Vendor Mobile Operations** - "Pocket Office" for vendor inventory management

### Strategic Sub-Phases

| Sub-Phase       | Focus         | Scope                                                |
| --------------- | ------------- | ---------------------------------------------------- |
| **2a (Core)**   | Transactional | Stripe Connect, Supabase Realtime, Vendor Web Portal |
| **2b (Trust)**  | Native        | Mobile Wrapper, Offline DB, Push Notifications       |
| **2c (Growth)** | Social        | Video Reviews, Social Features                       |

**This document covers Phase 2a (Core) architecture decisions.**

---

## Phase 1 Architecture Inheritance

### Preserved Decisions

The following Phase 1 decisions remain unchanged:

| Decision           | Phase 1 Choice               | Status       |
| ------------------ | ---------------------------- | ------------ |
| Database           | Supabase (PostgreSQL)        | ✅ Preserved |
| Auth Provider      | Supabase Auth                | ✅ Preserved |
| Frontend Framework | React 19 + TypeScript        | ✅ Preserved |
| Styling            | Tailwind CSS 4.x             | ✅ Preserved |
| State Management   | TanStack Query + Spark useKV | ✅ Preserved |
| Build Tool         | Vite 7.x                     | ✅ Preserved |
| Component Library  | Radix UI / shadcn patterns   | ✅ Preserved |

### Extended/Modified Decisions

| Decision    | Phase 1                 | Phase 2 Change                      |
| ----------- | ----------------------- | ----------------------------------- |
| API Pattern | SDK only                | SDK + Edge Functions for payments   |
| Data Access | Service Layer           | + Realtime subscriptions            |
| Auth Roles  | User only (mock vendor) | Full Vendor auth + KYC              |
| Offline     | Spark useKV (basic)     | + PWA Cache (2a), WatermelonDB (2b) |

---

## New Architectural Decisions - Phase 2a

### Payment Architecture

| Decision         | Choice                              | Rationale                                      |
| ---------------- | ----------------------------------- | ---------------------------------------------- |
| Payment Provider | **Stripe Connect (Express)**        | Industry standard, handles KYC, multi-currency |
| Charge Model     | **Destination Charges**             | Platform collects, transfers to vendors        |
| Card Handling    | **Stripe Elements**                 | SAQ-A PCI compliance, no card data in app      |
| Payment Methods  | Credit/Debit, Apple Pay, Google Pay | Stripe Payment Element handles all             |
| 3D Secure        | **Required**                        | Liability shift for chargebacks                |
| Escrow           | **Application Fee**                 | T+7 hold via Stripe payout schedule            |
| Refunds          | **Automated via API**               | Edge Function processes based on policy        |

**Stripe Connect Flow:**

```
User Payment → Stripe Checkout → Destination Charge → Platform Fee Deducted
                                       ↓
                            Vendor Connected Account → Payout (T+7)
```

### Real-Time Inventory Architecture

| Decision            | Choice                               | Rationale                           |
| ------------------- | ------------------------------------ | ----------------------------------- |
| Real-Time Engine    | **Supabase Realtime**                | Already integrated, WebSocket-based |
| Subscription Scope  | Per-experience availability          | Minimize connection overhead        |
| Concurrency Control | **Row-Level Locking (SERIALIZABLE)** | Prevent double-booking              |
| Inventory Decrement | **Database Trigger**                 | Atomic, server-side only            |
| Stale Detection     | **Activity Timestamp Check**         | Auto-disable Instant Book if stale  |

**Inventory Concurrency Pattern:**

```sql
-- Atomic inventory decrement with check
UPDATE experience_slots
SET available_count = available_count - 1
WHERE id = $1
  AND available_count > 0
  AND experience_id = $2
RETURNING id;
-- Returns NULL if no slots available (race condition safe)
```

### Vendor KYC & Onboarding Architecture

| Decision                 | Choice                              | Rationale                         |
| ------------------------ | ----------------------------------- | --------------------------------- |
| Identity Verification    | **Stripe Connect Express**          | Handles all KYC requirements      |
| Bank Verification        | **Stripe Connect**                  | Automated bank account validation |
| Verification State       | **State Machine in DB**             | Track vendor readiness            |
| Instant Book Eligibility | **Verified + Bank Linked + Active** | All three required                |

**Vendor State Machine:**

```
REGISTERED → KYC_SUBMITTED → KYC_VERIFIED → BANK_LINKED → ACTIVE
                   ↓              ↓             ↓
            KYC_REJECTED   KYC_REJECTED   SUSPENDED
```

### Audit & Compliance Architecture

| Decision        | Choice                                 | Rationale                 |
| --------------- | -------------------------------------- | ------------------------- |
| Audit Table     | `audit_logs`                           | Immutable event log       |
| Retention       | **7 years**                            | Tax/legal compliance      |
| Event Types     | Booking, Payment, Refund, Cancellation | Critical financial events |
| Webhook Storage | **Stripe Webhook ID**                  | Reconciliation capability |

**Audit Log Schema:**

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'booking.created', 'payment.succeeded', etc.
  entity_type TEXT NOT NULL, -- 'booking', 'payment', 'vendor'
  entity_id UUID NOT NULL,
  actor_id UUID REFERENCES auth.users(id),
  actor_type TEXT NOT NULL, -- 'user', 'vendor', 'system', 'stripe'
  metadata JSONB NOT NULL DEFAULT '{}',
  stripe_event_id TEXT, -- For webhook reconciliation
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Immutable: No UPDATE or DELETE policies
CREATE POLICY audit_insert_only ON audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);
```

---

## Edge Functions Architecture

### Required Edge Functions

| Function               | Purpose                        | Auth             |
| ---------------------- | ------------------------------ | ---------------- |
| `checkout`             | Create Stripe Checkout Session | User JWT         |
| `webhook-stripe`       | Handle Stripe webhooks         | Stripe Signature |
| `create-booking`       | Atomic booking + inventory     | User JWT         |
| `process-refund`       | Initiate refund per policy     | User/Admin JWT   |
| `vendor-onboard`       | Create Stripe Connect account  | Vendor JWT       |
| `vendor-payout-status` | Check payout status            | Vendor JWT       |

### Edge Function Patterns

**Checkout Function:**

```typescript
// supabase/functions/checkout/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Verify JWT and get user
  const authHeader = req.headers.get('Authorization')!;
  const {
    data: { user },
  } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

  const { tripId } = await req.json();

  // Fetch trip items with experience details
  const { data: trip } = await supabase
    .from('trips')
    .select(`*, trip_items(*, experiences(*))`)
    .eq('id', tripId)
    .single();

  // Create line items for Stripe
  const lineItems = trip.trip_items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.experiences.title },
      unit_amount: item.experiences.price_amount * 100,
    },
    quantity: item.guest_count,
  }));

  // Create Checkout Session with Destination Charge
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_intent_data: {
      application_fee_amount: calculatePlatformFee(trip.total),
      transfer_data: {
        destination: trip.trip_items[0].experiences.vendor.stripe_account_id,
      },
    },
    line_items: lineItems,
    success_url: `${Deno.env.get('APP_URL')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${Deno.env.get('APP_URL')}/checkout/cancel`,
    metadata: { tripId, userId: user.id },
  });

  return new Response(JSON.stringify({ sessionUrl: session.url }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

## Database Schema Extensions

### New Tables for Phase 2

```sql
-- Stripe Connected Accounts for Vendors
ALTER TABLE vendors ADD COLUMN stripe_account_id TEXT;
ALTER TABLE vendors ADD COLUMN stripe_onboarding_complete BOOLEAN DEFAULT false;
ALTER TABLE vendors ADD COLUMN instant_book_enabled BOOLEAN DEFAULT false;
ALTER TABLE vendors ADD COLUMN last_activity_at TIMESTAMPTZ;

-- Experience Slots (Time-based availability)
CREATE TABLE experience_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  total_capacity INTEGER NOT NULL,
  available_count INTEGER NOT NULL,
  price_override_amount INTEGER, -- NULL = use experience base price
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_slot UNIQUE (experience_id, slot_date, slot_time)
);

-- Payment Records
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_checkout_session_id TEXT,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  platform_fee INTEGER NOT NULL,
  vendor_payout INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  -- 'pending', 'succeeded', 'failed', 'refunded', 'partially_refunded'
  refund_amount INTEGER DEFAULT 0,
  refund_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Logs (as defined above)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  actor_id UUID REFERENCES auth.users(id),
  actor_type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  stripe_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_slots_experience_date ON experience_slots(experience_id, slot_date);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_stripe ON payments(stripe_payment_intent_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

### RLS Policies for New Tables

```sql
-- Experience Slots: Public read, vendor write
ALTER TABLE experience_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY slots_read ON experience_slots
  FOR SELECT USING (true);

CREATE POLICY slots_vendor_write ON experience_slots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM experiences e
      JOIN vendors v ON e.vendor_id = v.id
      WHERE e.id = experience_slots.experience_id
        AND v.owner_id = auth.uid()
    )
  );

-- Payments: Users see their own, vendors see their received
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY payments_user_read ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN trips t ON b.trip_id = t.id
      WHERE b.id = payments.booking_id
        AND t.user_id = auth.uid()
    )
  );

CREATE POLICY payments_vendor_read ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN experiences e ON b.experience_id = e.id
      JOIN vendors v ON e.vendor_id = v.id
      WHERE b.id = payments.booking_id
        AND v.owner_id = auth.uid()
    )
  );

-- Audit Logs: Insert only, no read by default (admin function)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_insert ON audit_logs
  FOR INSERT WITH CHECK (true);
-- Read access via service role only (Edge Functions)
```

---

## Real-Time Subscription Patterns

### Client-Side Subscription Pattern

```typescript
// src/lib/realtimeService.ts
import { supabase } from './supabase';

export function subscribeToSlotAvailability(
  experienceId: string,
  onUpdate: (slots: ExperienceSlot[]) => void,
) {
  return supabase
    .channel(`slots:${experienceId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'experience_slots',
        filter: `experience_id=eq.${experienceId}`,
      },
      (payload) => {
        // Refetch all slots for this experience
        fetchSlots(experienceId).then(onUpdate);
      },
    )
    .subscribe();
}

// Hook wrapper
export function useSlotSubscription(experienceId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = subscribeToSlotAvailability(experienceId, () => {
      queryClient.invalidateQueries({ queryKey: ['slots', experienceId] });
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [experienceId]);
}
```

### Booking Status Subscription

```typescript
export function subscribeToBookingStatus(
  bookingId: string,
  onUpdate: (booking: Booking) => void,
) {
  return supabase
    .channel(`booking:${bookingId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${bookingId}`,
      },
      (payload) => onUpdate(payload.new as Booking),
    )
    .subscribe();
}
```

---

## Service Layer Extensions

### New Services for Phase 2

```
src/lib/
  paymentService.ts        # Stripe operations
  slotService.ts           # Availability management
  realtimeService.ts       # Subscription management
  auditService.ts          # Audit log queries (admin)
```

### Payment Service Pattern

```typescript
// src/lib/paymentService.ts
import { supabase } from './supabase';

interface CheckoutResult {
  data: { sessionUrl: string } | null;
  error: string | null;
}

export async function createCheckoutSession(
  tripId: string,
): Promise<CheckoutResult> {
  try {
    const { data, error } = await supabase.functions.invoke('checkout', {
      body: { tripId },
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (e) {
    return { data: null, error: 'Failed to create checkout session' };
  }
}

export async function getPaymentStatus(bookingId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}
```

---

## Environment Configuration

### New Environment Variables

```env
# .env.local additions for Phase 2

# Stripe (Server-side - Edge Functions only)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLATFORM_ACCOUNT_ID=acct_...

# Stripe (Client-side - Publishable)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App URLs
VITE_APP_URL=https://pulau.app
```

### Supabase Edge Function Secrets

```bash
# Set via Supabase CLI
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Implementation Sequence

### Phase 2a Implementation Order

1. **Database Schema** (Story 20.2 extended)
   - Add new tables: `experience_slots`, `payments`, `audit_logs`
   - Add columns to `vendors` table
   - Create RLS policies

2. **Stripe Connect Vendor Onboarding** (New)
   - `vendor-onboard` Edge Function
   - Vendor dashboard Stripe Connect flow
   - Webhook handlers for account updates

3. **Availability Management** (New)
   - `slotService.ts` for CRUD
   - Vendor calendar UI integration
   - Realtime subscriptions

4. **Checkout Integration** (Epic 10 extension)
   - `checkout` Edge Function
   - Stripe Elements integration
   - Payment confirmation flow

5. **Booking with Inventory Lock** (New)
   - `create-booking` Edge Function with atomic decrement
   - Optimistic UI update
   - Failure rollback

6. **Audit Trail** (New)
   - Database triggers for auto-logging
   - Admin query functions

---

## Testing Strategy Extensions

### Payment Testing

| Test Type   | Tool                           | Coverage              |
| ----------- | ------------------------------ | --------------------- |
| Unit        | Vitest + MSW                   | Service layer mocking |
| Integration | Stripe Test Mode               | Full payment flow     |
| E2E         | Playwright + Stripe Test Cards | User journey          |

**Test Card Numbers:**

- Success: `4242424242424242`
- Decline: `4000000000000002`
- 3DS Required: `4000002500003155`

### Realtime Testing

```typescript
// Example test for realtime subscription
describe('Slot Availability Subscription', () => {
  it('receives updates when slots change', async () => {
    const updates: ExperienceSlot[] = [];

    const channel = subscribeToSlotAvailability('exp-123', (slots) => {
      updates.push(...slots);
    });

    // Simulate slot update via service role
    await adminClient
      .from('experience_slots')
      .update({ available_count: 5 })
      .eq('experience_id', 'exp-123');

    await waitFor(() => expect(updates.length).toBeGreaterThan(0));

    supabase.removeChannel(channel);
  });
});
```

---

## Security Considerations

### PCI DSS Compliance

| Requirement          | Implementation                         |
| -------------------- | -------------------------------------- |
| No card storage      | Stripe Elements handles all card data  |
| HTTPS only           | Enforced at infrastructure level       |
| Webhook verification | Stripe signature validation            |
| Access logging       | Audit trail for all payment operations |

### Fraud Prevention

| Vector         | Mitigation                   |
| -------------- | ---------------------------- |
| Card testing   | Stripe Radar + rate limiting |
| Friendly fraud | 3DS required + audit trail   |
| Fake vendors   | KYC via Stripe Connect       |
| Double-booking | Database-level row locking   |

---

## Architecture Validation Checklist

### Phase 2a Readiness

- [x] Payment provider selected with integration pattern
- [x] Real-time inventory architecture defined
- [x] Vendor KYC flow designed
- [x] Audit/compliance requirements addressed
- [x] Database schema extensions defined
- [x] RLS policies for new tables
- [x] Edge Function patterns established
- [x] Environment configuration documented
- [x] Implementation sequence defined
- [x] Testing strategy extended

### Deferred to Phase 2b

- [ ] Native mobile wrapper architecture
- [ ] Offline database sync patterns
- [ ] Push notification infrastructure
- [ ] Background location tracking

### Deferred to Phase 2c

- [ ] Video upload/streaming architecture
- [ ] Social feed patterns
- [ ] Advanced recommendation engine

---

## Architecture Status

**Phase 2a Architecture:** READY FOR IMPLEMENTATION ✅

**Confidence Level:** HIGH

**Key Phase 2a Capabilities Enabled:**

- Stripe Connect payment processing
- Real-time inventory with concurrency control
- Vendor onboarding with KYC
- Audit trail for compliance
- Instant Book eligibility engine

**Next Steps:**

1. Generate Phase 2 Epics & Stories from this architecture
2. Sprint planning for Phase 2a implementation
3. Begin with database schema extensions

---

## PRD Requirements Traceability

### Functional Requirements Coverage

| PRD Requirement                                  | Architecture Support                            | Status               |
| ------------------------------------------------ | ----------------------------------------------- | -------------------- |
| FR-VEN-01: Vendor Stripe Express KYC             | `vendor-onboard` Edge Function + Stripe Connect | ✅                   |
| FR-VEN-02: Instant Book vs Request policies      | `vendors.instant_book_enabled` + state machine  | ✅                   |
| FR-VEN-03: Cut-off Times                         | `experience_slots` with time constraints        | ✅                   |
| FR-BOOK-01: Filter by Instant Confirmation       | Query on `instant_book_enabled`                 | ✅                   |
| FR-BOOK-02: Real-time slot availability          | Supabase Realtime subscriptions                 | ✅                   |
| FR-BOOK-03: Credit Card / Apple Pay / Google Pay | Stripe Payment Element                          | ✅                   |
| FR-BOOK-04: Immediate PDF Ticket via Email       | Post-payment webhook + email service            | 🔶 Email service TBD |
| FR-OFF-01: Offline Active Ticket (PWA)           | Service Worker cache for ticket page            | ✅ PWA in 2a         |
| FR-OFF-02: Last Updated timestamp                | `updated_at` field on cached data               | ✅                   |
| FR-OPS-01: Push/SMS on new booking               | Webhook → notification service                  | 🔶 Push in 2b        |
| FR-OPS-02: Vendor QR code check-in               | PWA camera + validation                         | ✅                   |
| FR-OPS-03: Manual slot block/unblock             | `slotService.ts` + vendor UI                    | ✅                   |
| FR-ADM-01: Search bookings                       | Service layer queries                           | ✅                   |
| FR-ADM-02: Admin refund initiation               | `process-refund` Edge Function                  | ✅                   |
| FR-ADM-03: Immutable Audit Log                   | `audit_logs` table with RLS                     | ✅                   |

### Non-Functional Requirements Coverage

| NFR                       | Architecture Support               | Status |
| ------------------------- | ---------------------------------- | ------ |
| Real-Time Latency < 500ms | Supabase Realtime (WebSocket)      | ✅     |
| PWA TTI < 1.5s            | Vite optimization + Service Worker | ✅     |
| Offline Ticket 30 days    | PWA Cache + LocalDB (2b)           | ✅     |
| Sync Recovery < 10s       | Realtime reconnect + refetch       | ✅     |
| PCI DSS SAQ-A             | Stripe Elements only               | ✅     |
| Audit Retention 7 years   | `audit_logs` with no delete policy | ✅     |
| 10 concurrent bookings    | Row-level locking (SERIALIZABLE)   | ✅     |

### Innovation Requirements Coverage

| Innovation                  | Architecture Support              |
| --------------------------- | --------------------------------- |
| "Instant Confidence" Engine | Realtime + Stripe + PWA Cache     |
| Vendor OS "Pocket Office"   | PWA + Realtime + slotService      |
| No-Signal Test              | PWA Service Worker ticket caching |
| Double-Book Stress Test     | Database-level SERIALIZABLE lock  |

---

## Architecture Completion Summary

### Workflow Completion

**Phase 2 Architecture Workflow:** COMPLETED ✅
**Date Completed:** 2026-01-09
**Document Location:** `_bmad-output/planning-artifacts/architecture/phase-2-architecture.md`

### Final Deliverables

1. **Payment Architecture** - Stripe Connect with Destination Charges
2. **Real-Time Architecture** - Supabase Realtime with row-level locking
3. **Vendor KYC Architecture** - State machine for onboarding
4. **Audit Architecture** - Immutable log for compliance
5. **Database Extensions** - New tables with RLS policies
6. **Edge Functions** - 6 functions defined with patterns
7. **Service Layer Extensions** - New services for Phase 2
8. **Implementation Sequence** - Ordered execution plan

### Recommended Next Steps

1. **Generate Phase 2 Epics & Stories** - Break down architecture into implementable stories
2. **Sprint Planning** - Organize stories into Phase 2a sprint
3. **Database Migration** - Apply schema extensions first
4. **Stripe Setup** - Configure Stripe Connect platform account

---

_Document extends: `architecture.md` (Phase 1)_
_Author: Winston (Architect Agent)_
_Date: 2026-01-09_
