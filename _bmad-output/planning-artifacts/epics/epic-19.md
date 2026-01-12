## Epic 19: Multi-Destination Scalability

**Goal:** Platform supports multiple destinations beyond Bali with destination-agnostic architecture, configurable per-destination settings, and extensible data structures for global expansion.

### Story 19.1: Create Destinations Data Model

As a developer,
I want a destinations table and data model,
So that the platform can support multiple locations.

**Acceptance Criteria:**

**Given** the database schema
**When** destinations table is created
**Then** table includes:
  - id (UUID, primary key)
  - name (string, e.g., "Bali")
  - slug (string, unique, e.g., "bali")
  - country (string, e.g., "Indonesia")
  - currency (string, e.g., "USD")
  - timezone (string, e.g., "Asia/Makassar")
  - language_default (string, e.g., "en")
  - description (text)
  - hero_image_url (string)
  - is_active (boolean)
  - created_at, updated_at
**And** experiences.destination_id foreign key references destinations
**And** seed data includes Bali as first destination
**And** index on slug for quick lookup

### Story 19.2: Implement Destination Selector

As a traveler,
I want to select my destination,
So that I see relevant experiences.

**Acceptance Criteria:**

**Given** multiple destinations exist
**When** I open the app
**Then** if only one active destination, auto-select it
**When** multiple destinations are active
**Then** destination selector displays in header or splash
**And** selector shows: destination cards with image, name, tagline
**When** I select a destination
**Then** user_preferences.destination_id updates
**And** all experience queries filter by destination_id
**And** home screen shows destination-specific content
**And** destination name shows in header (e.g., "Explore Bali")

### Story 19.3: Apply Per-Destination Configuration

As a traveler in different destinations,
I want the app to adapt to local settings,
So that currency and timezone are correct.

**Acceptance Criteria:**

**Given** I select a destination
**When** destination configuration applies
**Then** currency displays in destination's default (can override in settings)
**And** experience times shown in destination timezone
**And** date formats respect locale
**And** destination-specific content (guides, stories) filters correctly
**When** destination changes currency from USD to IDR
**Then** prices convert using exchange rates
**And** price formatting changes (e.g., "Rp 500,000" vs "$50")

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

### Story 19.5: Create Future Destination Teaser

As a user interested in other destinations,
I want to see upcoming destinations,
So that I know the platform is expanding.

**Acceptance Criteria:**

**Given** additional destinations are planned but not active
**When** I view destination selector or explore screen
**Then** "Coming Soon" section shows teaser cards:
  - Destination name and image (grayed or with overlay)
  - "Coming Soon" badge
  - "Notify Me" button
**When** I tap "Notify Me"
**Then** my email added to destination_waitlist table (user_id, destination_id, created_at)
**And** toast: "We'll let you know when [destination] launches!"
**And** inactive destinations don't appear in main browse

