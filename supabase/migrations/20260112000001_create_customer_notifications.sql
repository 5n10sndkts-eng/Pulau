-- ================================================
-- Migration: Create Customer Notifications Table
-- Story: 30.4 - Create In-App Notification Center
-- AC #4: Database Persistence with Real-Time Updates
-- ================================================
-- Stores in-app notifications for travelers/customers.
-- Integrates with email notification system (Stories 30-1 to 30-3).
-- Supports real-time updates via Supabase Realtime.
-- ================================================

-- Create customer_notifications table
CREATE TABLE IF NOT EXISTS customer_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'booking_confirmed',
    'booking_cancelled',
    'reminder_24h',
    'reminder_2h'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add helpful comments
COMMENT ON TABLE customer_notifications IS 'In-app notifications for travelers. Story 30.4';
COMMENT ON COLUMN customer_notifications.type IS 'Notification type: booking_confirmed, booking_cancelled, reminder_24h, reminder_2h';
COMMENT ON COLUMN customer_notifications.read IS 'Whether the user has read/acknowledged this notification';

-- Index for fetching user notifications (newest first)
CREATE INDEX idx_customer_notifications_user_created
  ON customer_notifications(user_id, created_at DESC);

-- Index for counting unread notifications efficiently
CREATE INDEX idx_customer_notifications_user_unread
  ON customer_notifications(user_id)
  WHERE read = FALSE;

-- Index for looking up notifications by booking
CREATE INDEX idx_customer_notifications_booking_id
  ON customer_notifications(booking_id)
  WHERE booking_id IS NOT NULL;

-- Enable RLS
ALTER TABLE customer_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own notifications
CREATE POLICY "Users can read own notifications"
  ON customer_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON customer_notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Service role can insert notifications (from Edge Functions)
CREATE POLICY "Service role can insert notifications"
  ON customer_notifications
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- RLS Policy: Service role can manage all notifications
CREATE POLICY "Service role full access"
  ON customer_notifications
  FOR ALL
  USING (auth.role() = 'service_role');

-- ================================================
-- Cleanup function to limit notifications per user
-- Keeps only the most recent 100 notifications
-- ================================================
CREATE OR REPLACE FUNCTION cleanup_old_customer_notifications()
RETURNS TRIGGER AS $$
DECLARE
  notification_count INTEGER;
  excess_count INTEGER;
BEGIN
  -- Count total notifications for this user
  SELECT COUNT(*) INTO notification_count
  FROM customer_notifications
  WHERE user_id = NEW.user_id;

  -- If over limit, delete oldest
  IF notification_count > 100 THEN
    excess_count := notification_count - 100;

    DELETE FROM customer_notifications
    WHERE id IN (
      SELECT id
      FROM customer_notifications
      WHERE user_id = NEW.user_id
      ORDER BY created_at ASC
      LIMIT excess_count
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to enforce notification limit after insert
CREATE TRIGGER enforce_customer_notification_limit
  AFTER INSERT ON customer_notifications
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_old_customer_notifications();

-- ================================================
-- Enable Realtime for customer_notifications
-- Required for AC #4: Real-time updates
-- ================================================
ALTER PUBLICATION supabase_realtime ADD TABLE customer_notifications;

-- Grant permissions
GRANT SELECT, UPDATE ON customer_notifications TO authenticated;
GRANT ALL ON customer_notifications TO service_role;
