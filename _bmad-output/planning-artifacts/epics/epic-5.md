## Epic 5: Experience Data Model & Vendor Management

**Goal:** Vendors create, edit, and manage experiences with pricing, photos, descriptions, availability calendars, and detailed information. System provides vendor dashboard for analytics and performance tracking.

### Story 5.1: Create Experience with Vendor Database Integration

As a vendor,
I want to create a new experience listing,
So that travelers can discover and book my offerings.

**Acceptance Criteria:**

**Given** I am logged in as an approved vendor
**When** I click "Create New Experience"
**Then** Supabase client is configured for database operations if needed
**And** the experiences table schema is verified/created with columns:

- id (UUID, primary key)
- vendor_id (UUID, foreign key to vendors)
- title (string, max 200 chars)
- category (enum: water_adventures, land_explorations, culture_experiences, food_nightlife, transportation, stays)
- subcategory (string)
- destination_id (UUID, foreign key to destinations)
- description (text)
- price_amount (decimal), price_currency (string), price_per (enum)
- duration_hours (decimal), start_time (time)
- group_size_min/max (integer), difficulty (enum)
- languages (array), status (enum: draft, active, inactive)
- created_at, updated_at
  **And** related tables are created: experience_images, experience_inclusions, experience_availability
  **And** indexes are created on: vendor_id, category, destination_id, status
  **And** a new experience form loads with required fields
  **And** form validation prevents submission with incomplete data
  **And** successful creation stores experience in Supabase database
  **And** experience status is set to "DRAFT" for vendor review
  **And** RLS policies ensure vendors only access their own experiences

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

### Story 5.3: Implement Experience Image Upload

As a vendor,
I want to upload multiple photos for my experience,
So that travelers can see what I offer visually.

**Acceptance Criteria:**

**Given** I just created an experience (draft status) from Story 5.2
**When** I am on the image upload screen
**Then** I can upload 4-6 images via file picker or drag-and-drop
**And** accepted formats are JPG, PNG, WebP (max 10MB each)
**And** images are automatically resized to max 1920x1080 maintaining aspect ratio
**And** images are uploaded to cloud storage (S3/CDN)
**When** upload completes for each image
**Then** a record is created in experience_images table (experience_id, image_url, display_order)
**And** display_order is set based on upload sequence
**When** I reorder images via drag-and-drop
**Then** display_order values update in database
**And** at least 3 images are required before publishing experience
**And** upload progress indicator shows for each image
**And** failed uploads show retry button

### Story 5.4: Add Experience Editing Capabilities

As a vendor,
I want to edit my existing experiences,
So that I can keep information accurate and up-to-date.

**Acceptance Criteria:**

**Given** I have created experiences from previous stories
**When** I navigate to "My Experiences" list
**Then** I see all my experiences with: thumbnail, title, category, price, status
**When** I click "Edit" on an experience
**Then** the creation form opens pre-filled with existing data
**When** I modify any field and save
**Then** the experiences table record is updated with new values
**And** updated_at timestamp is set to current time
**And** change history is logged to experience_audit_log table (experience_id, vendor_id, changed_fields, old_values, new_values, changed_at)
**And** if experience status was "active", it remains active after edit
**And** I see success toast "Experience updated"
**And** changes reflect immediately in customer-facing views

### Story 5.5: Build Availability Calendar Management

As a vendor,
I want to manage which dates my experience is available,
So that travelers can only book when I'm operating.

**Acceptance Criteria:**

**Given** I am editing an experience
**When** I navigate to "Manage Availability" tab
**Then** I see a calendar UI for the next 12 months
**And** each date shows: Available (green), Limited Spots (yellow), Sold Out (red), Blocked (gray)
**When** I click a date
**Then** I can set: Status (Available/Blocked), Slots Available (number)
**And** changes save to experience_availability table (experience_id, date, slots_available, status)
**When** I select "Set Recurring Availability"
**Then** I can define: Days of week operating (checkboxes), Slots per day (number), Date range
**And** bulk records are created for matching dates
**And** blackout dates can be added to block specific days
**And** availability updates sync to customer views in real-time

### Story 5.6: Implement Experience Publishing Workflow

As a vendor,
I want to publish my draft experience to make it live,
So that travelers can discover and book it.

**Acceptance Criteria:**

**Given** I have a draft experience with all required fields completed
**When** I click "Publish Experience"
**Then** system validates:

- Title, description, price, duration, group size are filled
- At least 3 images are uploaded
- At least one availability date is set
- Meeting point information is complete
  **When** validation passes
  **Then** experience status changes from "draft" to "active"
  **And** experience becomes visible in customer search and browse
  **And** published_at timestamp is set
  **And** I see confirmation "Experience is now live!"
  **When** validation fails
  **Then** specific missing items are highlighted
  **And** error message lists requirements: "Complete these before publishing: [list]"

---
