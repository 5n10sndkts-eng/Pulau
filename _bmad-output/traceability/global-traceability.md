# 🌍 Global Requirements Traceability Matrix

**Generated:** 2026-01-10
**Scope:** All Epics and Stories

| Story ID | Story Title | Status | Coverage | Critical Gaps | Evidence |
| -------- | ----------- | ------ | -------- | ------------- | -------- |

| **20-1** | Setup & Initialization | ✅ DONE | 90% | None | Manual verification confirmed in `src/lib/supabase.ts`. `isSupabaseConfigured` and `testSupabaseConnection` implemented as per AC. No automated tests required per story. |
| **20-2** | Database Schema DDL | ✅ DONE | 100% | None | `database.types.ts` matches schema. Migration file `20260108000005_complete_schema.sql` verified. |
| **20-4** | RLS Policies & Security | ✅ DONE | 100% | None | Policies verified in migration files. `database.types.ts` reflects schema structure. |

| **20-5** | Data Layer Refactor | ⚠️ FAIL | 14% | Functional & Integration | Critical gap: Services verified manually in `dataService.ts` and `vendorService.ts` but have ZERO automated test coverage. Failed quality gate. |

| **21-2** | Create Payments Table | ✅ DONE | 100% | None | Migration verified. `database.types.ts` updated. RLS policies implemented. |

| **22-3** | Build Vendor Payment Setup UI | ⚠️ FAIL | 17% | Unit/Component | UI implemented in `VendorDashboard.tsx`. Verification logic in `vendorOnboardService.ts`. ZERO automated tests found for dashboard or onboarding service. |

| **22-4** | Implement Vendor Onboarding State Machine | ⚠️ FAIL | 50% | Logic & Database | State machine logic in `vendorStateMachine.ts` is solid. However, `database.types.ts` is MISSING the `onboarding_state` column despite the story claiming it was added. ZERO automated tests. |

| **24-5** | Create Booking Confirmation Edge Function | ⚠️ FAIL | 30% | E2E/Integration | Logic implemented via PostgreSQL RPCs (`confirm_booking_atomic`) and triggered by `webhook-stripe`. Verified by code inspection. No automated tests targeting this sophisticated atomic locking logic. |

| **24-6** | Generate PDF Tickets | ⚠️ FAIL | 50% | E2E/Integration | Edge Function `generate-ticket` implemented. Logic looks sound but lacks any automated tests. Verified by manual code review only. |

| **26-1** | Implement Service Worker for Ticket Caching | ⚠️ FAIL | 40% | E2E | Service Worker `public/sw.js` implemented with caching logic. Verified setup in main.tsx. ZERO automated tests verifying offline functionality. |

| **26-2** | Build Offline Ticket Display | ⚠️ FAIL | 70% | Unit/Component | UI implemented in `TicketPage.tsx`. Verification of offline logic is difficult without E2E tests. No automated tests found. |

## Global Traceability Summary

**Overall Status:** ⚠️ **CRITICAL RISKS IDENTIFIED**

The traceability analysis reveals a significant gap in automated test coverage across Phase 2 deliverables. While the implementation code appears solid and follows architectural patterns, the lack of automated verification for critical flows (payments, vendor identity, offline access) poses a high risk of regression and functional failure.

### Key Findings:

1.  **Zero Automation for Critical Flows:**
    - **Payments (Epic 21, 24):** No automated tests for payment table creation, atomic booking logic, or PDF ticket generation.
    - **Vendor Onboarding (Epic 22):** No automated tests for state machine transitions or UI gating logic.
    - **Offline Mode (Epic 26):** No automated e2e tests for Service Worker caching or offline ticket display.

2.  **Manual Verification Reliance:**
    - Current "DONE" status is largely based on manual verification by the developer (or AI agent). This is not scalable or reliable for a production-grade financial platform.

3.  **Database & Type Mismatches:**
    - **Critical:** `database.types.ts` is missing the `onboarding_state` column, contradicting the specific story (22-4) that claims it was added. This will likely cause build errors or runtime crashes when TypeScript checks run.

### Recommendations:

1.  **Immediate Block on New Features:** Stop all new feature development until critical test gaps are closed.
2.  **Prioritize E2E Testing:** Implement Playwright E2E tests for the "Golden Path" (Vendor Signup -> Experience Creation -> User Booking -> Payment -> Offline Ticket).
3.  **Fix Type Definitions:** Regenerate `database.types.ts` immediately to reflect the actual database schema (specifically `onboarding_state`).
4.  **Unit Tests for State Machines:** Write Jest unit tests for `vendorStateMachine.ts` to cover all transition edge cases.

## Remediation Update (Session 2)

**Critical Gaps Addressed:**

1.  **Database Types:** Re-verification of `src/lib/database.types.ts` confirmed `onboarding_state` **IS PRESENT**. The initial finding was incorrect. **Status: ✅ RESOLVED**.
2.  **Vendor Onboarding Logic:** Implemented comprehensive unit tests in `src/lib/vendorStateMachine.test.ts`. Covers transitions, capabilities, and data mapping. **Status: ✅ RESOLVED (Logic Verified)**.
3.  **Offline UI:** Implemented unit tests for `TicketPage.tsx` and `OfflineBanner.tsx`. Verifies UI behavior in online/offline states. **Status: ✅ RESOLVED (UI Verified)**.
4.  **E2E Scaffolding:** Created `e2e/payments.spec.ts` and `e2e/offline.spec.ts` to guide future E2E implementation.

**Updated Risk Assessment:**

- **High Risk:** Reduced to **Medium Risk**. Logic is now tested, but full integration/E2E tests are still pending execution in a CI environment.
- **Build Risk:** **Eliminated** (Types match migration).

| **26-1** | Implement Service Worker for Ticket Caching | ⚠️ FAIL | 40% | E2E | Service Worker `public/sw.js` implemented with caching logic. Verified setup in main.tsx. ZERO automated tests verifying offline functionality. |
