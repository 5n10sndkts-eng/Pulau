# Epic 9: Scheduling & Conflict Detection

**Goal:** System automatically detects when activities overlap in time, displays yellow warning banners with smart suggestions, and provides trip sharing via shareable links.

### Story 9.1: Implement Time Conflict Detection Algorithm
As a developer, I want an algorithm that detects scheduling conflicts, so that users are warned about overlapping activities.

**Acceptance Criteria:**
- **Given** scheduled trip items **When** conflict detection runs **Then** algorithm identifies overlaps where itemA.end_time > itemB.start_time AND itemA.start_time < itemB.end_time
- **And** conflict data includes item IDs and overlap duration
- **And** algorithm runs in <50ms for performance

### Story 9.2: Display Conflict Warning Banners
As a traveler, I want to see visual warnings when activities overlap, so that I can fix scheduling issues.

**Acceptance Criteria:**
- **Given** a detected conflict **When** viewing trip builder **Then** conflicting items show yellow warning banners with warning icon
- **And** banner background uses Golden Sand (#F4D03F)
- **And** banner disappears when conflict is resolved

### Story 9.3: Provide Smart Conflict Resolution Suggestions
As a traveler with a scheduling conflict, I want suggestions to resolve the overlap, so that I can quickly fix my itinerary.

**Acceptance Criteria:**
- **Given** conflict banner displayed **When** tapped **Then** bottom sheet opens suggesting: Move Item A/B, Move to another day, or Remove
- **When** suggestion selected **Then** action applies immediately and conflict detection re-runs

### Story 9.4: Create Shareable Trip Links
As a traveler, I want to share my trip plan with others, so that travel companions can see the itinerary.

**Acceptance Criteria:**
- **Given** trip builder screen **When** I tap share **Then** modal opens with "Copy Link" and "Share via..." options
- **And** link format: `pulau.app/trip/{uuid}`
- **And** link view is read-only and requires no login
