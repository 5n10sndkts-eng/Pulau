# Pulau - Epic & Story Index

This directory contains the sharded requirements and story breakdown for the Pulau project, organized according to the BMAD methodology for optimal AI context efficiency.

## Core Requirements
- [Global Requirements](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/requirements.md) (FRs, NFRs, ARCH)
- [ADR-001: Storage Strategy](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/architecture/ADR-001-storage-strategy.md) (KV for MVP, Supabase deferred)

---

## Epic Execution Order & Dependencies

### Phase 0: Foundation (Technical Prerequisite)
| Epic | Name | Dependencies | Status |
|------|------|--------------|--------|
| 1 | Foundation & Technical Infrastructure | None | Required first |
| 18 | Bottom Navigation & Screen Architecture | Epic 1 | Runs with Epic 1 |

### Phase 1: Core User Journey (MVP)
| Epic | Name | Dependencies | Status |
|------|------|--------------|--------|
| 6 | Experience Discovery & Browse | Epic 1 (mock data) | User value |
| 8 | Trip Canvas & Itinerary Building | Epic 1, 6 | User value |
| 7 | Wishlist & Saved Experiences | Epic 1, 6 | User value |
| 9 | Scheduling & Conflict Detection | Epic 8 | User value |
| 10 | Multi-Step Checkout & Booking | Epic 8, 9 | User value |
| 11 | Booking Management & History | Epic 10 | User value |

### Phase 2: Authentication & Personalization
| Epic | Name | Dependencies | Status |
|------|------|--------------|--------|
| 2 | User Authentication & Profile Management | Epic 1 | User value |
| 4 | Onboarding & Personalization | Epic 2 | User value |
| 13 | Profile & Settings Management | Epic 2 | User value |

### Phase 3: Vendor Features (Post-MVP)
| Epic | Name | Dependencies | Status |
|------|------|--------------|--------|
| 3 | Vendor Portal & Authentication | Epic 2 | Vendor value |
| 5 | Experience Data Model & Vendor Management | Epic 3 | Vendor value |
| 14 | Vendor Analytics & Revenue Tracking | Epic 3, 5 | Vendor value |
| 15 | Real-time Availability & Messaging | Epic 3, 5 | Vendor value |

### Phase 4: Polish & Scale (Post-MVP)
| Epic | Name | Dependencies | Status |
|------|------|--------------|--------|
| 12 | Explore & Discovery Features | Epic 6 | Enhancement |
| 19 | Multi-Destination Scalability | All core | Future |
| 20 | Backend Integration (Supabase) | All MVP | Production |

### Cross-Cutting (Integrate into Feature Epics)
| Epic | Name | Note |
|------|------|------|
| 16 | Mobile-First Responsive Design | Requirements apply to ALL epics |
| 17 | Edge Cases & Error Handling | Requirements apply to ALL epics |

---

## Epic Breakdown (Original Order)

1. [Epic 1: Foundation & Technical Infrastructure](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-01.md)
2. [Epic 2: User Authentication & Profile Management](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-02.md)
3. [Epic 3: Vendor Portal & Authentication](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-03.md)
4. [Epic 4: Onboarding & Personalization](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-04.md)
5. [Epic 5: Experience Data Model & Vendor Management](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-05.md)
6. [Epic 6: Experience Discovery & Browse](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-06.md)
7. [Epic 7: Wishlist & Saved Experiences](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-07.md)
8. [Epic 8: Trip Canvas & Itinerary Building](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-08.md)
9. [Epic 9: Scheduling & Conflict Detection](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-09.md)
10. [Epic 10: Multi-Step Checkout & Booking](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-10.md)
11. [Epic 11: Booking Management & History](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-11.md)
12. [Epic 12: Explore & Discovery Features](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-12.md)
13. [Epic 13: Profile & Settings Management](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-13.md)
14. [Epic 14: Vendor Analytics & Revenue Tracking](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-14.md)
15. [Epic 15: Real-time Availability & Messaging](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-15.md)
16. [Epic 16: Mobile-First Responsive Design](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-16.md) *(Cross-cutting)*
17. [Epic 17: Edge Cases & Error Handling](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-17.md) *(Cross-cutting)*
18. [Epic 18: Bottom Navigation & Screen Architecture](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-18.md)
19. [Epic 19: Multi-Destination Scalability](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-19.md)
20. [Epic 20: Backend Integration (Supabase)](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-20-backend-integration.md) *(Deferred)*
