# Sprint Change Proposal: Scope Pruning & MVP Alignment

**Date:** 2026-01-08
**Project:** Pulau
**Status:** Ready for Approval
**Trigger:** Implementation Readiness Review Failure

---

## 1. Executive Summary
The Implementation Readiness Review identified "Massive Scope Creep" (8 out of 20 epics were deferred/Phase 3 features). This proposal corrects the course by pruning the scope back to the strict "Traveler MVP" defined in the PRD and simplifying the authentication strategy to "Mock Auth with KV Store."

**Decision:** **PRUNE & ALIGN**
We are deferring 40% of the planned epics to Phase 2 and rewriting the core Auth/Checkout epics to remove SQL/Supabase dependencies.

---

## 2. Changes Executed

### 2.1 Scope Pruning (Moved to `phase-2-backlog/`)
The following epics have been removed from the active sprint backlog:
*   ❌ **Epic 3:** Vendor Portal (Phase 3)
*   ❌ **Epic 5:** Experience Data Model (Vendor features)
*   ❌ **Epic 13:** Advanced Profile Management
*   ❌ **Epic 14:** Vendor Analytics
*   ❌ **Epic 15:** Real-time Availability
*   ❌ **Epic 19:** Multi-Destination Scalability
*   ❌ **Epic 20:** Backend Integration (Supabase)

### 2.2 Epic Rewrites (MVP Alignment)
The following epics were rewritten to enforce "Mock Auth" and "KV Store" constraints:
*   ✅ **Epic 2 (Auth):** Rewritten as "Mock Auth Service." Removed email verification and password hashing.
*   ✅ **Epic 4 (Onboarding):** Removed "Phase 2" tag; linked to Mock Auth.
*   ✅ **Epic 6 (Discovery):** Clarified "Mock Data" source (JSON files).
*   ✅ **Epic 7 (Wishlist):** Replaced "database" with "Spark KV Store."
*   ✅ **Epic 8 (Trip Canvas):** Confirmed KV Store persistence.
*   ✅ **Epic 10 (Checkout):** Explicitly deferred Stripe; confirmed Mock Payment.
*   ✅ **Epic 11 (History):** Confirmed KV Store for booking history.

### 2.3 Artifact Alignment
*   **Epics Index:** Updated to reflect the new Phase 1 vs. Phase 2 structure.
*   **PRD:** No changes needed (Epics now align with existing PRD).
*   **Architecture:** No changes needed (Epics now align with existing ADR-001).

---

## 3. Revised MVP Definition
The "Pulau MVP" is now strictly defined as:
*   **User:** Traveler Only (No Vendors).
*   **Auth:** Mock Service (Login works, but no security).
*   **Data:** GitHub Spark KV Store (No SQL).
*   **Features:** Browse, Wishlist, Trip Builder, Mock Checkout, Booking History.

---

## 4. Handoff Plan
*   **Product Manager:** Update backlog tracking (Complete).
*   **Development Team:**
    *   Start **Epic 1 (Foundation)** immediately.
    *   Proceed to **Epic 6 (Discovery)** and **Epic 2 (Mock Auth)** in parallel.
    *   **Ignore** any references to Supabase tables or RLS policies.

---

## 5. Approval
**User Approval Required:**
Please confirm acceptance of this proposal to finalize the "Course Correction" and return to the implementation workflow.
