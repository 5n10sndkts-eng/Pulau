-- ================================================
-- Migration: Create Booking Reminders Table
-- Story: 30.3 - Implement Booking Reminder Scheduler
-- AC #3: Duplicate Prevention
-- ================================================
-- Tracks reminder emails sent to travelers before their experiences.
-- Prevents duplicate reminders and enables retry on failure.
-- ================================================

-- Create booking_reminders table
CREATE TABLE IF NOT EXISTS booking_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24h', '2h', 'morning')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'skipped', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate reminders for the same booking/type
  UNIQUE(booking_id, reminder_type)
);

-- Add helpful comment
COMMENT ON TABLE booking_reminders IS 'Tracks reminder emails sent before experiences. Story 30.3';
COMMENT ON COLUMN booking_reminders.reminder_type IS '24h = day before, 2h = 2 hours before, morning = same day morning';
COMMENT ON COLUMN booking_reminders.status IS 'pending = not yet sent, sent = successfully sent, skipped = not needed, failed = error occurred';

-- Index for efficient querying of pending reminders
CREATE INDEX idx_booking_reminders_pending
  ON booking_reminders(status, scheduled_for)
  WHERE status = 'pending';

-- Index for looking up reminders by booking
CREATE INDEX idx_booking_reminders_booking_id
  ON booking_reminders(booking_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_booking_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_reminders_updated_at
  BEFORE UPDATE ON booking_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_reminders_updated_at();

-- Enable RLS
ALTER TABLE booking_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only service role can manage reminders (system access only)
-- No user-facing policies needed as this is a backend-only table
CREATE POLICY "Service role full access to booking_reminders"
  ON booking_reminders
  FOR ALL
  USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON booking_reminders TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
