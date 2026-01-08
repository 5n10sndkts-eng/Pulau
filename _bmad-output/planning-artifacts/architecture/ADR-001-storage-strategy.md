# ADR-001: Storage Architecture Strategy

**Status:** Accepted
**Date:** 2026-01-08
**Decision Makers:** Moe, John (PM Agent)

---

## Context

The Pulau project has conflicting storage approaches across its planning documents:

| Document | Storage Approach |
|----------|------------------|
| PRD (Technical Architecture) | GitHub Spark KV Store |
| Architecture Decision Document | Spark useKV for persistence |
| Epic 2-7, 13 stories | References "database", "tables" |
| Epic 20 | Supabase migration |
| requirements.md ARCH14 | "Database schema design - Relational schema needed" |

This confusion would block developers in Sprint 1.

---

## Decision

### Phase 1: MVP (Current Sprint)

**Use GitHub Spark KV Store exclusively.**

| Data Type | KV Key Pattern | Structure |
|-----------|----------------|-----------|
| Users | `pulau_users_{userId}` | User object |
| User Preferences | `pulau_preferences_{userId}` | Preferences object |
| Trips | `pulau_trips_{userId}` | Trip[] array |
| Bookings | `pulau_bookings_{userId}` | Booking[] array |
| Experiences | `pulau_experiences` | Experience[] array (mock data) |
| Vendors | `pulau_vendors` | Vendor[] array (mock data) |
| Wishlists | `pulau_wishlist_{userId}` | string[] (experience IDs) |

**Rationale:**
- PRD explicitly chose KV over Supabase (see PRD lines 258-273)
- GitHub Spark platform constraint - useKV is the native persistence mechanism
- Simplifies MVP delivery - no backend setup, migrations, or auth complexity
- Client-side filtering is acceptable at MVP scale (<1000 experiences)

### Phase 2: Production (Post-MVP)

**Migrate to Supabase when:**
1. Multi-user data sharing required (vendor bookings, messaging)
2. Scale exceeds KV store limits (~5MB localStorage)
3. Real-time sync needed (availability updates)
4. Authentication security required (not demo/mock)

Epic 20 (Backend Integration) remains valid but is **OUT OF SCOPE for MVP**.

---

## Consequences

### What Changes in Epics

| Epic | Change Required |
|------|-----------------|
| Epic 2 | Stories 2.1-2.5: Replace "database" with "KV store" |
| Epic 3 | Stories 3.1-3.2: Replace "database" with "KV store" |
| Epic 4 | Story 4.2: Change "user_preferences table" to "KV namespace" |
| Epic 5 | Story 5.1: **REMOVE** - No database schema for MVP |
| Epic 5 | Stories 5.2-5.6: Use mock experience data |
| Epic 7 | Story 7.1: Already correct ("Spark useKV") |
| Epic 13 | Story 13.4: Replace "database" with "KV store" |
| Epic 20 | **DEFER** to Phase 2 |

### Authentication Approach for MVP

| Aspect | MVP Approach | Production Approach |
|--------|--------------|---------------------|
| User Creation | Mock auth service with KV storage | Supabase Auth |
| Session | localStorage token | Supabase session |
| Password | bcrypt hash in KV (insecure for prod) | Supabase managed |
| Verification | Skip email verification | Email verification |

**Note:** MVP auth is demo-quality only. Production requires Epic 20.

### Trade-offs Accepted

| Trade-off | Impact | Mitigation |
|-----------|--------|------------|
| No multi-device sync | Users see data only on one browser | Document limitation |
| No real vendor data | All experiences are mock | Clear "demo" indicator |
| Insecure auth | Anyone can access localStorage | Not production-ready |
| 5MB limit | Can't store many bookings | Pagination, cleanup |

---

## Implementation Guidance

### For Story Authors

Replace this terminology:

| ❌ Don't Use | ✅ Use Instead |
|--------------|----------------|
| "in the database" | "in the KV store" |
| "users table" | "`pulau_users_{userId}` KV key" |
| "SQL query" | "client-side filter" |
| "foreign key" | "embedded reference (userId)" |
| "database migration" | "KV schema version check" |
| "transaction" | "atomic KV update" |

### For Developers

```typescript
// MVP Pattern - Use useKV
const [trips, setTrips] = useKV<Trip[]>(`pulau_trips_${userId}`, []);

// NOT this (Phase 2 only)
// const { data } = await supabase.from('trips').select('*');
```

---

## Related Documents

- PRD: Lines 258-273 "Why KV Store Instead of Supabase?"
- Architecture: Lines 107-109 "State Management"
- Epic 20: Deferred to Phase 2

---

**Approved by:** John (PM Agent)
**Next Action:** Update Epic 2-7, 13 stories to use KV terminology
