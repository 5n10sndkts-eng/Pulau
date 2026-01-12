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
