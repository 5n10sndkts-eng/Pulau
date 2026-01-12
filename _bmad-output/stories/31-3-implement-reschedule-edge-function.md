### 31-3: Implement Reschedule Edge Function
- Validate against modification policy
- Release old slot, reserve new slot atomically
- Process any fee difference via Stripe
- AC: Atomic transaction with audit logging
