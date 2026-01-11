-- ============================================================================
-- Migration: Create Booking Modifications Table
-- Story: 31-1 - Define Modification Policy Schema
-- Epic: 31 - Booking Modifications & Rescheduling
-- ============================================================================
-- Tracks all booking modification requests (reschedule, guest count change)
-- with vendor approval workflow support.
-- ============================================================================

-- Modification request statuses
CREATE TYPE IF NOT EXISTS modification_request_status AS ENUM (
  'pending',      -- Awaiting vendor approval
  'approved',     -- Vendor approved, awaiting execution
  'rejected',     -- Vendor rejected the request
  'executed',     -- Modification completed
  'cancelled',    -- Customer cancelled the request
  'expired'       -- Request expired without action
);

-- Modification types
CREATE TYPE IF NOT EXISTS modification_type AS ENUM (
  'reschedule',      -- Change date/time
  'guest_change',    -- Change number of guests
  'combined'         -- Both reschedule and guest change
);

-- Create booking_modifications table
CREATE TABLE IF NOT EXISTS booking_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  trip_item_id UUID NOT NULL REFERENCES trip_items(id) ON DELETE CASCADE,
  requestor_id UUID NOT NULL REFERENCES profiles(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),

  -- Modification type
  modification_type modification_type NOT NULL,

  -- Status tracking
  status modification_request_status NOT NULL DEFAULT 'pending',

  -- Original values (for audit trail)
  original_date DATE,
  original_time TIME,
  original_guests INTEGER,
  original_total_price INTEGER, -- cents

  -- Requested new values
  requested_date DATE,
  requested_time TIME,
  requested_guests INTEGER,

  -- Calculated values
  price_difference INTEGER DEFAULT 0, -- cents (positive = customer owes more)
  new_total_price INTEGER, -- cents

  -- Vendor response
  vendor_response_at TIMESTAMPTZ,
  vendor_response_by UUID REFERENCES profiles(id),
  vendor_notes TEXT,
  rejection_reason TEXT,

  -- Execution tracking
  executed_at TIMESTAMPTZ,
  payment_intent_id TEXT, -- For additional charges if price_difference > 0
  refund_id TEXT, -- For partial refunds if price_difference < 0

  -- Request metadata
  customer_notes TEXT,
  expires_at TIMESTAMPTZ NOT NULL, -- Auto-expire pending requests

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_booking_modifications_booking_id ON booking_modifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_modifications_vendor_id ON booking_modifications(vendor_id);
CREATE INDEX IF NOT EXISTS idx_booking_modifications_status ON booking_modifications(status);
CREATE INDEX IF NOT EXISTS idx_booking_modifications_requestor_id ON booking_modifications(requestor_id);
CREATE INDEX IF NOT EXISTS idx_booking_modifications_expires_at ON booking_modifications(expires_at)
  WHERE status = 'pending';

-- Add modification policy columns to experiences table
ALTER TABLE experiences
ADD COLUMN IF NOT EXISTS modification_policy JSONB DEFAULT '{"allowed": true, "cutoff_hours": 24, "max_reschedules": 2, "price_change_cap_percent": 50}'::jsonb,
ADD COLUMN IF NOT EXISTS reschedule_allowed BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS guest_change_allowed BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS modification_cutoff_hours INTEGER DEFAULT 24;

-- Add modification tracking to trip_items
ALTER TABLE trip_items
ADD COLUMN IF NOT EXISTS modification_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMPTZ;

-- RLS Policies
ALTER TABLE booking_modifications ENABLE ROW LEVEL SECURITY;

-- Customers can view their own modification requests
CREATE POLICY "Customers can view own modification requests"
  ON booking_modifications
  FOR SELECT
  USING (requestor_id = auth.uid());

-- Customers can create modification requests for their bookings
CREATE POLICY "Customers can create modification requests"
  ON booking_modifications
  FOR INSERT
  WITH CHECK (
    requestor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM bookings b
      JOIN trips t ON b.trip_id = t.id
      WHERE b.id = booking_id AND t.user_id = auth.uid()
    )
  );

-- Customers can cancel their pending requests
CREATE POLICY "Customers can cancel pending requests"
  ON booking_modifications
  FOR UPDATE
  USING (
    requestor_id = auth.uid()
    AND status = 'pending'
  )
  WITH CHECK (status = 'cancelled');

-- Vendors can view modification requests for their experiences
CREATE POLICY "Vendors can view modification requests for their experiences"
  ON booking_modifications
  FOR SELECT
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE owner_id = auth.uid()
    )
  );

-- Vendors can update (approve/reject) modification requests
CREATE POLICY "Vendors can respond to modification requests"
  ON booking_modifications
  FOR UPDATE
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE owner_id = auth.uid()
    )
    AND status = 'pending'
  )
  WITH CHECK (status IN ('approved', 'rejected'));

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_booking_modifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_booking_modifications_updated_at
  BEFORE UPDATE ON booking_modifications
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_modifications_updated_at();

-- Add comments for documentation
COMMENT ON TABLE booking_modifications IS 'Tracks booking modification requests including reschedules and guest count changes';
COMMENT ON COLUMN booking_modifications.price_difference IS 'Price difference in cents. Positive means customer owes more.';
COMMENT ON COLUMN booking_modifications.expires_at IS 'Pending requests expire after this time if vendor does not respond';
COMMENT ON COLUMN experiences.modification_policy IS 'JSON policy for modification rules: {allowed, cutoff_hours, max_reschedules, price_change_cap_percent}';
