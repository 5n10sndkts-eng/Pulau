# Epic 5: Experience Data Model & Vendor Management

**Goal:** Vendors create, edit, and manage experiences with pricing, photos, descriptions, availability calendars, and detailed information. System provides vendor dashboard for analytics and performance tracking.

**Phase:** Post-MVP (requires Epic 3 Vendor Auth)
**Dependencies:** Epic 3 (Vendor Portal)

---

### ~~Story 5.1: Design and Create Experiences Database Schema~~ [DEFERRED]

> **⚠️ DEFERRED per ADR-001:** MVP uses mock experience data with KV store.
> This story moves to Epic 20 (Backend Integration) for Supabase implementation.
>
> **MVP Alternative:** Experience data comes from `src/lib/mockData.ts` via the existing `getExperiences()` function. No schema creation needed.

~~As a developer, I want a comprehensive experiences database schema, so that all experience data is properly structured and queryable.~~

~~**Acceptance Criteria:**~~
~~- **Given** vendor auth is in place **When** schema is created **Then** experiences table exists with UUID, vendor_id, title, category, price, and stats~~
~~- **And** related tables exist: experience_images, experience_inclusions, experience_availability~~
~~- **And** indexes are created on vendor_id, category, and status~~

---

### Story 5.2: Build Vendor Experience Creation Form

As a vendor, I want to create a new experience listing, so that travelers can discover and book my offering.

**Acceptance Criteria:**

- **Given** I am logged in as vendor **When** I navigate to "Add New" **Then** I see a multi-step form for basic info, pricing, details, and location
- **When** I submit **Then** a "draft" record is created and I am redirected to image upload
- **And** validation prevents submission with invalid data

### Story 5.3: Implement Experience Image Upload

As a vendor, I want to upload multiple photos for my experience, so that travelers can see what I offer visually.

**Acceptance Criteria:**

- **Given** a draft experience **When** I upload 4-6 images **Then** they are resized, stored in cloud storage, and records created in experience_images
- **And** I can reorder images via drag-and-drop
- **And** at least 3 images are required before publishing

### Story 5.4: Add Experience Editing Capabilities

As a vendor, I want to edit my existing experiences, so that I can keep information accurate and up-to-date.

**Acceptance Criteria:**

- **Given** existing experiences **When** I click "Edit" **Then** the form is pre-filled with existing data
- **When** I save **Then** the record and audit log are updated
- **And** changes reflect immediately in customer views

### Story 5.5: Build Availability Calendar Management

As a vendor, I want to manage which dates my experience is available, so that travelers can only book when I'm operating.

**Acceptance Criteria:**

- **Given** I am editing an experience **Then** I see a 12-month calendar UI showing availability status
- **When** I click a date **Then** I can set status and slots
- **And** I can define recurring availability for days of the week

### Story 5.6: Implement Experience Publishing Workflow

As a vendor, I want to publish my draft experience to make it live, so that travelers can discover and book it.

**Acceptance Criteria:**

- **Given** complete draft data **When** I click "Publish" **Then** system validates all required fields, images, and availability
- **When** validation passes **Then** status changes to "active" and becomes visible to customers
