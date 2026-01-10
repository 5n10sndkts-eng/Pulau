-- Migration: Add atomic inventory decrement function
-- Story: 25.3 - Implement Atomic Inventory Decrement
-- Created: 2026-01-10
--
-- This function provides atomic, race-condition-free inventory decrements
-- using PostgreSQL row-level locking (SELECT FOR UPDATE).
--
-- Requirements:
-- - NFR-CON-01: Handle 10 concurrent booking attempts with zero overbookings
-- - Use SELECT FOR UPDATE for row-level locking
-- - Return error if slot is unavailable or sold out

CREATE OR REPLACE FUNCTION decrement_slot_inventory(
  p_slot_id UUID,
  p_count INTEGER DEFAULT 1
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot experience_slots%ROWTYPE;
  v_new_count INTEGER;
BEGIN
  -- Validate input
  IF p_count <= 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Count must be positive',
      'available_count', NULL
    );
  END IF;

  -- Lock the row for update and fetch current state
  -- This prevents race conditions by acquiring an exclusive row lock
  SELECT * INTO v_slot
  FROM experience_slots
  WHERE id = p_slot_id
  FOR UPDATE;  -- Critical: This locks the row until transaction commits

  -- Check if slot exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Slot not found',
      'available_count', NULL
    );
  END IF;

  -- Check if slot is blocked
  IF v_slot.is_blocked = true THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Slot is blocked',
      'available_count', v_slot.available_count
    );
  END IF;

  -- Check if enough availability
  IF v_slot.available_count < p_count THEN
    RETURN json_build_object(
      'success', false,
      'error', format('Slot no longer available. Requested: %s, Available: %s', p_count, v_slot.available_count),
      'available_count', v_slot.available_count
    );
  END IF;

  -- Perform atomic decrement
  v_new_count := v_slot.available_count - p_count;

  UPDATE experience_slots
  SET 
    available_count = v_new_count,
    updated_at = NOW()
  WHERE id = p_slot_id;

  -- Return success with new count
  RETURN json_build_object(
    'success', true,
    'error', NULL,
    'available_count', v_new_count
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Handle any unexpected errors
    RETURN json_build_object(
      'success', false,
      'error', format('Database error: %s', SQLERRM),
      'available_count', NULL
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION decrement_slot_inventory(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_slot_inventory(UUID, INTEGER) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION decrement_slot_inventory IS 'Atomically decrements slot inventory with row-level locking to prevent overbookings. Returns JSON with success status, error message, and new available_count.';
