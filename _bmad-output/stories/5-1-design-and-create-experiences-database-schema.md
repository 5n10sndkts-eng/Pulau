### Story 5.1: Design and Create Experiences Database Schema

As a developer,
I want a comprehensive experiences database schema,
So that all experience data is properly structured and queryable.

**Acceptance Criteria:**

**Given** the vendor authentication system is in place
**When** the experiences schema is created
**Then** experiences table exists with columns:

- id (UUID, primary key)
- vendor_id (UUID, foreign key to vendors)
- title (string, max 200 chars)
- category (enum: water_adventures, land_explorations, culture_experiences, food_nightlife, transportation, stays)
- subcategory (string)
- destination_id (UUID, foreign key to destinations)
- description (text)
- price_amount (decimal)
- price_currency (string, default USD)
- price_per (enum: person, vehicle, group)
- duration_hours (decimal)
- start_time (time)
- group_size_min (integer)
- group_size_max (integer)
- difficulty (enum: Easy, Moderate, Challenging)
- languages (array of strings)
- status (enum: draft, active, inactive, sold_out)
- created_at, updated_at
  **And** related tables are created:
- experience_images (id, experience_id, image_url, display_order, created_at)
- experience_inclusions (id, experience_id, item_text, is_included boolean, created_at)
- experience_availability (id, experience_id, date, slots_available, status)
  **And** indexes are created on: vendor_id, category, destination_id, status
