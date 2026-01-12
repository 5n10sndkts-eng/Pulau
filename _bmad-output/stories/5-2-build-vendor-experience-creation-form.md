### Story 5.2: Build Vendor Experience Creation Form

As a vendor,
I want to create a new experience listing,
So that travelers can discover and book my offering.

**Acceptance Criteria:**

**Given** I am logged in to the vendor portal
**When** I navigate to "Add New Experience"
**Then** I see a multi-step creation form with sections:
  - Basic Info: Title, Category dropdown, Subcategory, Description textarea
  - Pricing: Price amount, Currency, Per (person/vehicle/group)
  - Details: Duration (hours), Start time, Group size (min/max), Difficulty dropdown, Languages multi-select
  - Location: Meeting point address, Latitude, Longitude (map picker)
  - What's Included: Add multiple inclusions (checkmark items), Add multiple exclusions (X mark items)
**When** I fill all required fields and submit
**Then** a new record is created in experiences table with status = "draft"
**And** vendor_id is set to my logged-in vendor ID
**And** created_at timestamp is set
**And** I see success message "Experience created as draft"
**And** I am redirected to image upload step
**And** validation prevents submission with: empty title, invalid price, min > max group size
