# Retrospective - Epic 28: Admin Refunds & Audit Trail

**Date**: 2026-01-08
**Participants**: Moe, Bob, Alice, Charlie, Dana

## Overview

Epic 28 delivered critical financial compliance features: refund processing and immutable audit logs. The team successfully integrated Stripe Refunds API and built a robust audit service.

## Successes

- **Audit Service Design**: Variable audit logging service proved flexible and easy to use across the app.
- **Stripe Integration**: Refund processing worked flawlessly in testing, handling edge cases like partial refunds.
- **Security**: RLS policies for audit logs were implemented correctly from day one.

## Challenges

- **Search Performance**: Initial booking search was slow; required adding indexes to `bookings` table.
- **UI Complexity**: The refund interface needed 3 iterations to get the UX right for partial refunds.

## Key Learnings

- **Financial State Machines**: Dealing with refund states (requested -> processing -> succeeded) requires careful state management.
- **Index Early**: We should think about DB indexes during story implementation, not just when performance lags.

## Action Items

- [x] **Add DB Indexing Checklist**: Update PR template to include "DB Indexes Checked" (Responsible: Charlie)
- [ ] **Refector UI Components**: Extract the "Amount Input" component used in refunds for reuse in other forms.
