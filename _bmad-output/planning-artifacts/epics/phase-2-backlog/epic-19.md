# Epic 19: Multi-Destination Scalability

**Goal:** Platform supports multiple destinations beyond Bali with destination-agnostic architecture, configurable per-destination settings, and extensible data structures for global expansion.

### Story 19.1: Create Destinations Data Model
As a developer, I want a destinations table and data model, so that the platform can support multiple locations.

**Acceptance Criteria:**
- **Given** schema **When** destinations table created **Then** columns include name, slug, country, currency, timezone, and locale
- **And** seed data includes Bali as first destination; experiences table references destination_id

### Story 19.2: Implement Destination Selector
As a traveler, I want to select my destination, so that I see relevant experiences.

**Acceptance Criteria:**
- **Given** multiple active destinations **When** app opened **Then** a destination selector displays
- **When** selected **Then** preferences update; all queries filter by destination_id; home screen adapts

### Story 19.3: Apply Per-Destination Configuration
As a traveler in different destinations, I want the app to adapt to local settings, so that currency and timezone are correct.

**Acceptance Criteria:**
- **Given** destination selected **When** applied **Then** currency and timezone display according to destination defaults
- **And** all price calculations use appropriate exchange rates and formatting

### Story 19.4: Prepare Experience Schema for Multi-Destination
As a vendor, I want my experiences linked to a specific destination, so that travelers in that location can find them.

**Acceptance Criteria:**
- **Given** vendor creating experience **When** form loads **Then** destination is pre-selected or selectable
- **And** record only appears for travelers matching that destination_id

### Story 19.5: Create Future Destination Teaser
As a user interested in other destinations, I want to see upcoming destinations, so that I know the platform is expanding.

**Acceptance Criteria:**
- **Given** planned destinations **When** viewed **Then** "Coming Soon" teaser cards appear with "Notify Me" buttons
- **When** "Notify Me" tapped **Then** email is added to waitlist
