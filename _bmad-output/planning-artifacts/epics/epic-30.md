## Epic 30: Customer Notification System

**Goal**: Keep customers informed about their bookings via email and in-app notifications.

**Stories**:

### 30-1: Create Email Notification Edge Function

- Send transactional emails via SendGrid/Resend
- Support booking confirmation, reminder, and cancellation templates
- Include PDF ticket attachment
- AC: Emails sent within 30 seconds of trigger event

### 30-2: Build Email Template System

- Create responsive HTML email templates
- Include Pulau branding and booking details
- Support multiple languages (English, Indonesian)
- AC: Templates render correctly across email clients

### 30-3: Implement Booking Reminder Scheduler

- Send reminder 24 hours before experience
- Send morning-of reminder with meeting point
- Configurable reminder timing per vendor
- AC: Scheduled jobs via Supabase pg_cron or Edge Function

### 30-4: Create In-App Notification Center

- Display notification bell with unread count
- Show notification history (booking updates, reminders)
- Mark as read/unread functionality
- AC: Notifications table with real-time updates

### 30-5: Add SMS Notification Support (Optional)

- Send SMS for critical notifications (day-of reminders)
- Use Twilio or similar provider
- Configurable per customer preference
- AC: SMS delivery with opt-in/opt-out

**Dependencies**: Epic 24 (Booking Confirmation)

---
