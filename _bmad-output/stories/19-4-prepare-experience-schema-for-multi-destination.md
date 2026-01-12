### Story 19.4: Prepare Experience Schema for Multi-Destination

As a vendor,
I want my experiences linked to a specific destination,
So that travelers in that location can find them.

**Acceptance Criteria:**

**Given** a vendor creates an experience
**When** the creation form loads
**Then** destination is pre-selected based on vendor's location or selectable
**And** experience record includes destination_id
**And** experience only appears in browse/search when matching user's selected destination
**When** admin adds a new destination
**Then** vendors in that region can create experiences for it
**And** existing experiences remain in their original destination
