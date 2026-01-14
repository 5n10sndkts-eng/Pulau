-- Migration: Add refund tracking columns to payments and bookings tables
-- Story: 28-7 - Implement Refund Processing
-- Date: 2026-01-13

-- Add refund columns to payments table
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS refund_id TEXT,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

COMMENT ON COLUMN payments.refund_id IS 'Stripe refund ID (re_xxx) for tracking';
COMMENT ON COLUMN payments.refunded_at IS 'Timestamp when refund was processed';

-- Add refund tracking columns to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS refunded_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

COMMENT ON COLUMN bookings.refunded_by IS 'User ID (admin or customer) who initiated the refund';
COMMENT ON COLUMN bookings.refunded_at IS 'Timestamp when booking was fully refunded';

-- Create index for refund queries
CREATE INDEX IF NOT EXISTS idx_payments_refund_id ON payments(refund_id);
CREATE INDEX IF NOT EXISTS idx_bookings_refunded_at ON bookings(refunded_at);
CREATE INDEX IF NOT EXISTS idx_bookings_refunded_by ON bookings(refunded_by);
