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
