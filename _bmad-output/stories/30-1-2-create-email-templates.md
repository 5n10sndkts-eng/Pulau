# Story 30.1.2: Create Email Templates

Status: not-started
Epic: 30 - Customer Notification System
Phase: Launch Readiness Sprint - Phase 1
Priority: P0

## Story

As a **customer**,
I want to receive beautifully designed, mobile-responsive email notifications,
So that I have all booking information clearly presented and easily accessible.

## Acceptance Criteria

1. **Given** a booking confirmation email is sent
   **When** the customer views it
   **Then** it displays:
   - Pulau branding and logo
   - Booking summary (experience, date, time, guests)
   - QR code for ticket
   - Add to calendar link
   - Cancellation policy
   - Support contact

2. **Given** a booking reminder email is sent (24h before)
   **When** the customer views it
   **Then** it displays:
   - Experience details and location
   - What to bring / preparation tips
   - Weather forecast (if available)
   - Contact vendor button
   - QR code for quick check-in

3. **Given** a cancellation confirmation email is sent
   **When** the customer views it
   **Then** it displays:
   - Cancelled booking details
   - Refund amount and timeline
   - Rebooking suggestions
   - Feedback request

4. **Given** emails are viewed on mobile or desktop
   **When** rendered in major email clients
   **Then** they:
   - Display correctly in Gmail, Outlook, Apple Mail
   - Are mobile-responsive
   - Have working CTA buttons
   - Load images properly

## Tasks / Subtasks

- [ ] Task 1: Set up email template infrastructure (AC: #4)
  - [ ] 1.1: Create template directory structure
  - [ ] 1.2: Set up base HTML email layout with Pulau branding
  - [ ] 1.3: Add CSS inlining build step
  - [ ] 1.4: Create template testing harness

- [ ] Task 2: Create booking confirmation template (AC: #1)
  - [ ] 2.1: Design HTML layout for booking confirmation
  - [ ] 2.2: Add dynamic variables ({{customerName}}, {{experienceTitle}}, etc.)
  - [ ] 2.3: Embed QR code image
  - [ ] 2.4: Add calendar link generation (.ics file)
  - [ ] 2.5: Include cancellation policy section

- [ ] Task 3: Create booking reminder template (AC: #2)
  - [ ] 3.1: Design reminder email layout
  - [ ] 3.2: Add preparation tips section
  - [ ] 3.3: Include location map/directions
  - [ ] 3.4: Add contact vendor CTA button

- [ ] Task 4: Create cancellation template (AC: #3)
  - [ ] 4.1: Design cancellation confirmation layout
  - [ ] 4.2: Add refund details section
  - [ ] 4.3: Include rebooking suggestions
  - [ ] 4.4: Add feedback survey link

- [ ] Task 5: Test across email clients (AC: #4)
  - [ ] 5.1: Test in Gmail (desktop and mobile)
  - [ ] 5.2: Test in Outlook (desktop and web)
  - [ ] 5.3: Test in Apple Mail (iOS and macOS)
  - [ ] 5.4: Use Email on Acid or Litmus for automated testing
  - [ ] 5.5: Fix rendering issues and optimize

## Dev Notes

### Architecture Patterns & Constraints

**Template Location:**
`supabase/functions/send-email/templates/`

**Base Email Layout:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{subject}}</title>
    <style>
      /* Inline CSS for email client compatibility */
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px 20px;
        text-align: center;
      }
      .logo {
        color: white;
        font-size: 32px;
        font-weight: bold;
      }
      /* Mobile responsive */
      @media only screen and (max-width: 600px) {
        .container {
          width: 100% !important;
        }
      }
    </style>
  </head>
  <body>
    <!-- Template content -->
  </body>
</html>
```

**Template Variables (Booking Confirmation):**

```typescript
interface BookingConfirmationData {
  customerName: string;
  experienceTitle: string;
  experienceDescription: string;
  bookingDate: string; // "Saturday, January 15, 2026"
  bookingTime: string; // "10:00 AM"
  guestCount: number;
  totalAmount: string; // "$120.00"
  qrCodeUrl: string;
  bookingId: string;
  vendorName: string;
  vendorContact: string;
  cancellationPolicy: string;
  supportEmail: string;
}
```

**Template Variables (Reminder):**

```typescript
interface BookingReminderData {
  customerName: string;
  experienceTitle: string;
  startTime: string; // "Tomorrow at 10:00 AM"
  location: string;
  locationMapUrl: string;
  preparationTips: string[];
  weatherForecast?: string;
  vendorContactUrl: string;
  qrCodeUrl: string;
}
```

**Template Variables (Cancellation):**

```typescript
interface CancellationData {
  customerName: string;
  experienceTitle: string;
  originalDate: string;
  refundAmount: string;
  refundTimeline: string; // "5-10 business days"
  rebookingUrl: string;
  feedbackUrl: string;
}
```

**Email Design Guidelines:**

- Use web-safe fonts (Arial, Helvetica, Georgia)
- Inline all CSS (use juice or similar)
- Keep width ≤ 600px
- Use table-based layouts for Outlook compatibility
- Test dark mode rendering
- Optimize images (< 200KB total)
- Include alt text for all images
- Add preheader text (hidden preview text)

**Button CTA Pattern:**

```html
<table role="presentation" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td style="border-radius: 4px; background: #667eea;">
      <a
        href="{{ctaUrl}}"
        style="
        display: inline-block;
        padding: 16px 32px;
        font-size: 16px;
        color: #ffffff;
        text-decoration: none;
        font-weight: 600;
      "
        >{{ctaText}}</a
      >
    </td>
  </tr>
</table>
```

**Add to Calendar (.ics generation):**

```typescript
const generateICS = (booking: Booking) => {
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Pulau//Booking//EN
BEGIN:VEVENT
UID:${booking.id}@pulau.app
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(booking.start_time)}
DTEND:${formatICSDate(booking.end_time)}
SUMMARY:${booking.experience_title}
DESCRIPTION:${booking.experience_description}
LOCATION:${booking.location}
END:VEVENT
END:VCALENDAR`;
};
```

## Testing Strategy

### Email Client Testing Matrix

| Client     | Desktop | Mobile | Dark Mode |
| ---------- | ------- | ------ | --------- |
| Gmail      | ✅      | ✅     | ✅        |
| Outlook    | ✅      | ✅     | ✅        |
| Apple Mail | ✅      | ✅     | ✅        |
| Yahoo Mail | ✅      | N/A    | ✅        |
| ProtonMail | ✅      | ✅     | ✅        |

### Testing Tools

- **Email on Acid** - Automated rendering tests across 90+ clients
- **Litmus** - Alternative email testing platform
- **Mailtrap** - Email testing environment
- **Real device testing** - iOS and Android

### Spam Score Testing

- Check SPF, DKIM, DMARC records
- Test spam assassin score (target: < 5)
- Avoid spam trigger words
- Include unsubscribe link (transactional exempt but good practice)

## Dependencies

- Pulau brand assets (logo, colors, fonts)
- QR code generation service (see Story 27.3)
- Weather API (optional for reminders)

## Success Metrics

- Email render score > 90% (Email on Acid)
- Load time < 2 seconds
- CTA click-through rate > 20%
- Spam placement rate < 1%
- Mobile open rate > 60%

## Related Files

- `supabase/functions/send-email/templates/booking-confirmation.html` (to create)
- `supabase/functions/send-email/templates/booking-reminder.html` (to create)
- `supabase/functions/send-email/templates/cancellation.html` (to create)
- `supabase/functions/send-email/templates/base.html` (to create)
- `supabase/functions/send-email/utils/ics-generator.ts` (to create)

## Design References

- [Really Good Emails](https://reallygoodemails.com) - Inspiration
- [Cerberus Email Patterns](https://tedgoas.github.io/Cerberus/) - Responsive templates
- [Email Frameworks](https://github.com/foundation/foundation-emails) - Foundation for Emails
