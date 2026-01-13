## Epic 26: Offline Ticket Access (PWA)

Travelers can access their booking tickets and QR codes without network connectivity.

### Story 26.1: Implement Service Worker for Ticket Caching

As a **traveler**,
I want my tickets cached for offline access,
So that I can show my ticket even without internet.

**Acceptance Criteria:**

**Given** I have a confirmed booking
**When** I view my ticket page while online
**Then** the Service Worker caches:

- Ticket page HTML/JS/CSS
- QR code image
- Booking metadata (experience name, time, meeting point)
  **And** cached data persists for 30 days
  **And** cache is updated when I view the ticket online

---

### Story 26.2: Build Offline Ticket Display

As a **traveler**,
I want to view my ticket when offline,
So that I can gain entry to my experience.

**Acceptance Criteria:**

**Given** I have a cached ticket
**When** I am offline and open my ticket page
**Then** I see:

- QR code (prominently displayed)
- Experience name and date/time
- Guest count
- Meeting point information
- "Offline Mode" indicator
- "Last Updated" timestamp
  **And** the page loads in < 1.5 seconds (TTI)
  **And** I can access the ticket from my bookings list

---

### Story 26.3: Show Last Updated Timestamp

As a **traveler**,
I want to see when my ticket data was last updated,
So that I know if the information is current.

**Acceptance Criteria:**

**Given** I am viewing a cached ticket offline
**When** the ticket displays
**Then** I see "Last updated: [timestamp]" (e.g., "Last updated: 2 hours ago")
**And** if data is older than 24 hours, I see a warning
**And** a "Refresh" button is available (grayed out when offline)

---

### Story 26.4: Implement Network Restoration Sync

As a **traveler**,
I want my app to sync automatically when I regain connectivity,
So that I have the latest booking information.

**Acceptance Criteria:**

**Given** I was offline and network is restored
**When** the app detects connectivity
**Then** within 10 seconds it:

- Syncs any pending state changes
- Refreshes cached ticket data
- Updates booking status if changed
- Shows brief "Syncing..." indicator
  **And** if booking was cancelled while offline, I see a clear notification

---

### Story 26.5: PWA Installation and Offline Indicator

As a **traveler**,
I want to install Pulau as a PWA,
So that I have app-like access to my tickets.

**Acceptance Criteria:**

**Given** I visit Pulau on a mobile browser
**When** the PWA installation prompt appears
**Then** I can add Pulau to my home screen
**And** the PWA icon reflects Pulau branding
**And** when launched, shows splash screen
**And** when offline, shows "Offline" banner at top of app
**And** offline-capable pages remain functional

---
