### Story 13.7: Add About, Terms, and Privacy Pages

As a user,
I want to access legal and company information,
So that I understand the service.

**Acceptance Criteria:**

**Given** I tap "About Pulau" from profile
**When** the about screen loads
**Then** I see:
  - Pulau logo and tagline
  - App version number
  - Brief company description
  - Links: "Terms of Service", "Privacy Policy", "Licenses"
**When** I tap Terms or Privacy
**Then** respective policy page opens (markdown rendered or webview)
**And** content loads from static files or CMS
**And** pages are scrollable with proper formatting

---
