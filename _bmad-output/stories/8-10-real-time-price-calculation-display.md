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
