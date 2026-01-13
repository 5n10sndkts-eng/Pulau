-- Migration: Refine ticket validation RPC function
-- Story: 27.2 - Implement Ticket Validation Logic
-- Ensures consistent checking of 'status' column and robust multi-vendor handling.

-- Drop the function first to allow changing return type
DROP FUNCTION IF EXISTS validate_booking_for_checkin(UUID, UUID);

CREATE OR REPLACE FUNCTION validate_booking_for_checkin(
  p_booking_id UUID,
  p_vendor_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking_record RECORD;
  v_items JSONB;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- 1. Check if booking exists and get basic info
  SELECT
    b.id,
    b.reference,
    b.status,
    b.trip_id
  INTO v_booking_record
  FROM bookings b
  WHERE b.id = p_booking_id;

  IF v_booking_record.id IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'booking_not_found',
      'message', 'This ticket is not in our system.'
    );
  END IF;

  -- 2. Check booking status
  IF v_booking_record.status = 'cancelled' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'booking_cancelled',
      'message', 'This booking has been cancelled.'
    );
  END IF;

  IF v_booking_record.status = 'refunded' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'booking_refunded',
      'message', 'This booking has been refunded.'
    );
  END IF;

  IF v_booking_record.status = 'checked_in' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'already_checked_in',
      'message', 'This guest has already checked in.'
    );
  END IF;

  -- 3. Find items in this trip belonging to the vendor
  SELECT jsonb_agg(jsonb_build_object(
    'id', ti.id,
    'experience_name', e.title,
    'slot_time', ti.time,
    'date', ti.date,
    'guests', ti.guests,
    'status', b.status,
    'is_today', (ti.date = v_today)
  ))
  INTO v_items
  FROM trip_items ti
  JOIN experiences e ON ti.experience_id = e.id
  JOIN bookings b ON b.trip_id = ti.trip_id
  WHERE b.id = p_booking_id
  AND e.vendor_id = p_vendor_id;

  -- 4. Check if vendor has any items in this booking
  IF v_items IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'unauthorized',
      'message', 'This ticket does not contain any experiences from your business.'
    );
  END IF;

  -- 5. Check if any items are for today
  IF NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(v_items) item
    WHERE (item->>'is_today')::boolean = true
  ) THEN
    DECLARE
      v_booking_date TEXT;
    BEGIN
      SELECT item->>'date' INTO v_booking_date
      FROM jsonb_array_elements(v_items) item
      LIMIT 1;

      RETURN jsonb_build_object(
        'valid', false,
        'reason', 'wrong_date',
        'message', format('This booking is for %s, not today (%s)', v_booking_date, v_today)
      );
    END;
  END IF;

  -- 6. Return success with items
  RETURN jsonb_build_object(
    'valid', true,
    'message', 'Check-in authorized.',
    'booking', jsonb_build_object(
      'id', v_booking_record.id,
      'reference', v_booking_record.reference,
      'items', v_items
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'internal_error',
      'message', format('Database error: %s', SQLERRM)
    );
END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION validate_booking_for_checkin(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_booking_for_checkin(UUID, UUID) TO service_role;
