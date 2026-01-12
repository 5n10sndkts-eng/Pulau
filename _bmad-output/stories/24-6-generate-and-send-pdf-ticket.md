### Story 24.6: Generate and Send PDF Ticket

As a **traveler**,
I want to receive a PDF ticket immediately after booking,
So that I have proof of purchase and entry credentials.

**Acceptance Criteria:**

**Given** my booking is confirmed
**When** confirmation processing completes
**Then** a PDF ticket is generated containing:
  - QR code encoding booking ID
  - Experience name and date/time
  - Guest count
  - Meeting point information
  - Vendor contact info
  - Cancellation policy
**And** PDF is emailed to my registered email
**And** PDF is stored and accessible from my bookings page
**And** email delivery is logged for support reference

---
