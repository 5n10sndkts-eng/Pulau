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
| 2 | Mock User Authentication & Profile (KV Only) | Epic 1 | User Value (Mock) |
| 6 | Experience Discovery & Browse | Epic 1 (mock data) | User value |
| 8 | Trip Canvas & Itinerary Building | Epic 1, 6 | User value |
| 7 | Wishlist & Saved Experiences | Epic 1, 6 | User value |
| 9 | Scheduling & Conflict Detection | Epic 8 | User value |
| 10 | Multi-Step Checkout & Booking | Epic 8, 9 | User value |
| 11 | Booking Management & History | Epic 10 | User value |

### Phase 2: Deferred Backlog (Post-MVP)
*These epics have been moved to the `phase-2-backlog/` directory to strictly scope the MVP.*

| Epic | Name | Reason for Deferral |
|------|------|---------------------|
| 3 | Vendor Portal & Authentication | Vendor features are Phase 3 per PRD |
| 5 | Experience Data Model & Vendor Management | Vendor features are Phase 3 per PRD |
| 13 | Profile & Settings Management (Advanced) | Basic profile is in Epic 2, advanced is Phase 2 |
| 14 | Vendor Analytics & Revenue Tracking | Vendor features are Phase 3 per PRD |
| 15 | Real-time Availability & Messaging | Real-time features are Phase 3 per PRD |
| 19 | Multi-Destination Scalability | Scale feature, not MVP |
| 20 | Backend Integration (Supabase) | MVP uses KV Store per PRD |

### Phase 4: Polish & Scale (Post-MVP)
| Epic | Name | Dependencies | Status |
|------|------|--------------|--------|
| 12 | Explore & Discovery Features | Epic 6 | Enhancement |

### Cross-Cutting (Integrate into Feature Epics)
| Epic | Name | Note |
|------|------|------|
| 16 | Mobile-First Responsive Design | Requirements apply to ALL epics |
| 17 | Edge Cases & Error Handling | Requirements apply to ALL epics |

---

## Epic Breakdown (MVP Only)

1. [Epic 1: Foundation & Technical Infrastructure](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-01.md)
2. [Epic 2: Mock User Authentication & Profile](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-02.md)
4. [Epic 4: Onboarding & Personalization](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-04.md)
6. [Epic 6: Experience Discovery & Browse](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-06.md)
7. [Epic 7: Wishlist & Saved Experiences](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-07.md)
8. [Epic 8: Trip Canvas & Itinerary Building](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-08.md)
9. [Epic 9: Scheduling & Conflict Detection](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-09.md)
10. [Epic 10: Multi-Step Checkout & Booking](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-10.md)
11. [Epic 11: Booking Management & History](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-11.md)
12. [Epic 12: Explore & Discovery Features](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-12.md)
16. [Epic 16: Mobile-First Responsive Design](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-16.md) *(Cross-cutting)*
17. [Epic 17: Edge Cases & Error Handling](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-17.md) *(Cross-cutting)*
18. [Epic 18: Bottom Navigation & Screen Architecture](file:///Users/moe/Pulau/_bmad-output/planning-artifacts/epics/epic-18.md)

*(Epics 3, 5, 13, 14, 15, 19, 20 are now in `phase-2-backlog/`)*
