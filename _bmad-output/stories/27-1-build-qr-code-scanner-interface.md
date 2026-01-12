### Story 27.1: Build QR Code Scanner Interface

As a **vendor**,
I want to scan traveler QR codes,
So that I can validate their tickets at check-in.

**Acceptance Criteria:**

**Given** I am on my vendor operations page
**When** I tap "Scan Ticket"
**Then** the device camera activates for QR scanning
**And** I can scan any booking QR code
**And** after successful scan, I see booking details:
  - Traveler name
  - Experience name
  - Time slot
  - Guest count
  - Check-in status

---
