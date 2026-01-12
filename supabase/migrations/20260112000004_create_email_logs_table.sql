-- Migration: Create email_logs table
-- Story: 30.1.1 - Implement send-email Edge Function
-- Epic: 30 - Customer Notification System
-- Phase: Launch Readiness Sprint - Phase 1
-- Created: 2026-01-12

-- ================================================
-- Email Logs Table
-- ================================================
-- Tracks all email send attempts, delivery status, and failures
-- Used for monitoring email deliverability and troubleshooting
-- Separate from audit_logs for email-specific metrics and analytics

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Email identifiers
  resend_message_id TEXT, -- ID from Resend API
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  
  -- Email details
  to_email TEXT NOT NULL, -- Recipient email address
  template TEXT NOT NULL, -- Template type: booking_confirmation, booking_cancellation, booking_reminder
  subject TEXT,
  
  -- Delivery status
  status TEXT NOT NULL DEFAULT 'sent', -- sent, delivered, bounced, failed
  error_message TEXT, -- Error details if failed
  
  -- Metadata
  metadata JSONB, -- Additional context (has_attachment, reminder_type, etc.)
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ, -- When email was delivered (from webhook)
  bounced_at TIMESTAMPTZ, -- When email bounced (from webhook)
  complained_at TIMESTAMPTZ, -- When marked as spam (from webhook)
  bounce_reason TEXT -- Bounce/complaint reason
);

-- ================================================
-- Indexes
-- ================================================

-- Query by booking
CREATE INDEX idx_email_logs_booking_id
  ON email_logs(booking_id);

-- Query by status
CREATE INDEX idx_email_logs_status
  ON email_logs(status);

-- Query by template type
CREATE INDEX idx_email_logs_template
  ON email_logs(template);

-- Query recent emails
CREATE INDEX idx_email_logs_created_at
  ON email_logs(created_at DESC);

-- Find failed emails
CREATE INDEX idx_email_logs_failed
  ON email_logs(status)
  WHERE status IN ('failed', 'bounced');

-- Query by Resend message ID (for webhook updates)
CREATE INDEX idx_email_logs_resend_message_id
  ON email_logs(resend_message_id)
  WHERE resend_message_id IS NOT NULL;

-- ================================================
-- Updated At Trigger
-- ================================================

CREATE OR REPLACE FUNCTION update_email_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_logs_updated_at
  BEFORE UPDATE ON email_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_email_logs_updated_at();

-- ================================================
-- RLS Policies
-- ================================================

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role can manage email_logs"
  ON email_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view their own booking's email logs
CREATE POLICY "Users can view their booking email logs"
  ON email_logs
  FOR SELECT
  TO authenticated
  USING (
    booking_id IN (
      SELECT b.id
      FROM bookings b
      JOIN trips t ON t.id = b.trip_id
      WHERE t.user_id = auth.uid()
    )
  );

-- Vendors can view emails for their experiences' bookings
CREATE POLICY "Vendors can view email logs for their bookings"
  ON email_logs
  FOR SELECT
  TO authenticated
  USING (
    booking_id IN (
      SELECT b.id
      FROM bookings b
      JOIN experiences e ON e.id = b.experience_id
      JOIN vendors v ON v.id = e.vendor_id
      WHERE v.user_id = auth.uid()
    )
  );

-- ================================================
-- Helper Functions
-- ================================================

-- Get email delivery stats for a booking
CREATE OR REPLACE FUNCTION get_booking_email_stats(p_booking_id UUID)
RETURNS TABLE (
  total_sent BIGINT,
  total_delivered BIGINT,
  total_failed BIGINT,
  total_bounced BIGINT,
  last_sent_at TIMESTAMPTZ,
  last_delivered_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_sent,
    COUNT(*) FILTER (WHERE status = 'delivered') AS total_delivered,
    COUNT(*) FILTER (WHERE status = 'failed') AS total_failed,
    COUNT(*) FILTER (WHERE status = 'bounced') AS total_bounced,
    MAX(created_at) AS last_sent_at,
    MAX(delivered_at) AS last_delivered_at
  FROM email_logs
  WHERE booking_id = p_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get overall email delivery rate (last 24 hours)
CREATE OR REPLACE FUNCTION get_email_delivery_rate()
RETURNS TABLE (
  total_sent BIGINT,
  total_delivered BIGINT,
  total_failed BIGINT,
  delivery_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_sent,
    COUNT(*) FILTER (WHERE status = 'delivered') AS total_delivered,
    COUNT(*) FILTER (WHERE status IN ('failed', 'bounced')) AS total_failed,
    CASE
      WHEN COUNT(*) > 0 THEN
        ROUND((COUNT(*) FILTER (WHERE status = 'delivered')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
      ELSE 0
    END AS delivery_rate
  FROM email_logs
  WHERE created_at >= now() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- Cleanup Function
-- ================================================

-- Delete old email logs (>90 days) to prevent table bloat
CREATE OR REPLACE FUNCTION cleanup_old_email_logs()
RETURNS void AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM email_logs
  WHERE created_at < now() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Deleted % old email log records', deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- Comments
-- ================================================

COMMENT ON TABLE email_logs IS 'Tracks all email send attempts and delivery status for monitoring and troubleshooting. Story 30.1.1';
COMMENT ON COLUMN email_logs.resend_message_id IS 'Unique message ID from Resend API for tracking delivery';
COMMENT ON COLUMN email_logs.status IS 'Email delivery status: sent (initial), delivered (confirmed), bounced (rejected), failed (error)';
COMMENT ON COLUMN email_logs.metadata IS 'Additional context like attachment presence, retry count, reminder type';
