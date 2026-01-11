-- ============================================================================
-- Migration: Modification Helper Functions
-- Story: 31-1 - Define Modification Policy Schema
-- Epic: 31 - Booking Modifications & Rescheduling
-- ============================================================================
-- RPC functions to check modification eligibility and calculate prices.
-- ============================================================================

-- Function to check if modification is allowed
CREATE OR REPLACE FUNCTION check_modification_allowed(
  p_trip_item_id UUID,
  p_modification_type TEXT DEFAULT 'reschedule'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_experience RECORD;
  v_trip_item RECORD;
  v_hours_until_start NUMERIC;
BEGIN
  -- Get trip item details
  SELECT * INTO v_trip_item FROM trip_items WHERE id = p_trip_item_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Trip item not found'
    );
  END IF;

  -- Get experience details
  SELECT * INTO v_experience FROM experiences WHERE id = v_trip_item.experience_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Experience not found'
    );
  END IF;

  -- Check if modification type is allowed
  IF p_modification_type = 'reschedule' AND NOT COALESCE(v_experience.reschedule_allowed, true) THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Rescheduling is not allowed for this experience'
    );
  END IF;

  IF p_modification_type = 'guest_change' AND NOT COALESCE(v_experience.guest_change_allowed, true) THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Guest count changes are not allowed for this experience'
    );
  END IF;

  -- Calculate hours until experience start
  IF v_trip_item.date IS NOT NULL AND v_trip_item.time IS NOT NULL THEN
    v_hours_until_start := EXTRACT(EPOCH FROM (
      (v_trip_item.date + v_trip_item.time::time) - now()
    )) / 3600;

    -- Check cutoff time
    IF v_hours_until_start < COALESCE(v_experience.modification_cutoff_hours, 24) THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', format('Modifications must be made at least %s hours before the experience',
                        COALESCE(v_experience.modification_cutoff_hours, 24)),
        'hours_until_start', v_hours_until_start,
        'cutoff_hours', COALESCE(v_experience.modification_cutoff_hours, 24)
      );
    END IF;
  END IF;

  -- Check modification count limit
  IF COALESCE(v_trip_item.modification_count, 0) >= 2 THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Maximum number of modifications (2) reached for this booking'
    );
  END IF;

  -- All checks passed
  RETURN jsonb_build_object(
    'allowed', true,
    'modification_count', COALESCE(v_trip_item.modification_count, 0),
    'max_modifications', 2,
    'cutoff_hours', COALESCE(v_experience.modification_cutoff_hours, 24)
  );
END;
$$;

-- Function to calculate price difference for modification
CREATE OR REPLACE FUNCTION calculate_modification_price(
  p_trip_item_id UUID,
  p_new_date DATE DEFAULT NULL,
  p_new_time TIME DEFAULT NULL,
  p_new_guests INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trip_item RECORD;
  v_experience RECORD;
  v_slot RECORD;
  v_original_total INTEGER;
  v_new_total INTEGER;
  v_price_per_guest INTEGER;
  v_price_difference INTEGER;
  v_guest_count INTEGER;
BEGIN
  -- Get trip item
  SELECT * INTO v_trip_item FROM trip_items WHERE id = p_trip_item_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Trip item not found');
  END IF;

  -- Get experience
  SELECT * INTO v_experience FROM experiences WHERE id = v_trip_item.experience_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Experience not found');
  END IF;

  -- Determine guest count
  v_guest_count := COALESCE(p_new_guests, v_trip_item.guests, 1);

  -- Get slot for the new date/time (if specified)
  IF p_new_date IS NOT NULL AND p_new_time IS NOT NULL THEN
    SELECT * INTO v_slot
    FROM experience_slots
    WHERE experience_id = v_trip_item.experience_id
      AND slot_date = p_new_date
      AND slot_time = p_new_time::text
      AND NOT COALESCE(is_blocked, false)
      AND available_count >= v_guest_count;

    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'error', 'No available slot for the requested date/time',
        'requested_date', p_new_date,
        'requested_time', p_new_time,
        'requested_guests', v_guest_count
      );
    END IF;
  END IF;

  -- Calculate prices
  v_original_total := v_trip_item.total_price;

  -- Price per guest from experience
  v_price_per_guest := v_experience.price_amount;

  -- Use slot price override if available
  IF v_slot IS NOT NULL AND v_slot.price_override_amount IS NOT NULL THEN
    v_price_per_guest := v_slot.price_override_amount;
  END IF;

  -- Calculate new total
  v_new_total := v_price_per_guest * v_guest_count;

  -- Calculate difference
  v_price_difference := v_new_total - v_original_total;

  RETURN jsonb_build_object(
    'original_total', v_original_total,
    'new_total', v_new_total,
    'price_difference', v_price_difference,
    'price_per_guest', v_price_per_guest,
    'guests', v_guest_count,
    'slot_available', v_slot IS NOT NULL OR (p_new_date IS NULL AND p_new_time IS NULL),
    'original_date', v_trip_item.date,
    'original_time', v_trip_item.time,
    'original_guests', v_trip_item.guests
  );
END;
$$;

-- Function to execute an approved modification
CREATE OR REPLACE FUNCTION execute_booking_modification(
  p_modification_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_modification RECORD;
  v_trip_item RECORD;
  v_result JSONB;
BEGIN
  -- Get modification request
  SELECT * INTO v_modification FROM booking_modifications WHERE id = p_modification_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Modification request not found');
  END IF;

  -- Check status
  IF v_modification.status != 'approved' THEN
    RETURN jsonb_build_object('error', 'Modification must be approved before execution');
  END IF;

  -- Get trip item
  SELECT * INTO v_trip_item FROM trip_items WHERE id = v_modification.trip_item_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Trip item not found');
  END IF;

  -- Update trip item with new values
  UPDATE trip_items SET
    date = COALESCE(v_modification.requested_date, date),
    time = COALESCE(v_modification.requested_time::text, time),
    guests = COALESCE(v_modification.requested_guests, guests),
    total_price = COALESCE(v_modification.new_total_price, total_price),
    modification_count = COALESCE(modification_count, 0) + 1,
    last_modified_at = now()
  WHERE id = v_modification.trip_item_id;

  -- Update modification status
  UPDATE booking_modifications SET
    status = 'executed',
    executed_at = now()
  WHERE id = p_modification_id;

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'modification_id', p_modification_id,
    'trip_item_id', v_modification.trip_item_id,
    'executed_at', now()
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_modification_allowed(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_modification_price(UUID, DATE, TIME, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_booking_modification(UUID) TO authenticated;
