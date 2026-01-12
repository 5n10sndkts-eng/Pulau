### Story 24.1: Create Checkout Edge Function

As a **platform operator**,
I want a `checkout` Edge Function,
So that Stripe Checkout Sessions are created securely.

**Acceptance Criteria:**

**Given** a traveler initiates checkout
**When** the `checkout` Edge Function is called
**Then** it validates:
  - User is authenticated
  - All items in cart have available inventory
  - All experiences accept the user's payment method
**And** creates a Stripe Checkout Session with:
  - `mode: 'payment'`
  - `payment_method_types: ['card']`
  - Line items for each experience booking
  - `payment_intent_data.transfer_data.destination` for each vendor
  - Platform fee calculated (e.g., 15%)
  - Success and cancel URLs
**And** returns the Checkout Session URL
**And** creates a `payments` record with status = 'pending'

---
