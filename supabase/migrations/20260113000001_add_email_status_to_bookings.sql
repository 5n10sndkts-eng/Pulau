-- Migration: Add email status columns to bookings table
-- Story: 30.1.4 - Add Email Triggers to Checkout
-- Epic: 30 - Customer Notification System
-- Created: 2026-01-13

-- ================================================
-- Email Status Columns on Bookings
-- ================================================
-- Tracks whether confirmation email was sent and when
-- Enables UI to show email status and resend button

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_resend_count INTEGER DEFAULT 0;

COMMENT ON COLUMN bookings.email_sent IS 'Whether confirmation email was successfully sent';
COMMENT ON COLUMN bookings.email_sent_at IS 'Timestamp when email was sent';
COMMENT ON COLUMN bookings.email_resend_count IS 'Number of times email was resent';

-- Index for querying bookings with pending emails
CREATE INDEX IF NOT EXISTS idx_bookings_email_pending
  ON bookings(email_sent)
  WHERE email_sent = false;

-- ================================================
-- Failed Emails Queue Table
-- ================================================
-- Stores email failures for manual follow-up
-- Used when retry logic exhausts all attempts

CREATE TABLE IF NOT EXISTS failed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  template TEXT NOT NULL DEFAULT 'booking_confirmation',
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_failed_emails_booking_id
  ON failed_emails(booking_id);

CREATE INDEX IF NOT EXISTS idx_failed_emails_unresolved
  ON failed_emails(resolved)
  WHERE resolved = false;

-- RLS
ALTER TABLE failed_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage failed_emails"
  ON failed_emails
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admins can view and resolve failed emails
CREATE POLICY "Admins can view failed_emails"
  ON failed_emails
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update failed_emails"
  ON failed_emails
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
