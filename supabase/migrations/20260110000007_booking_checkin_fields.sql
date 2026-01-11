-- Migration: Update bookings table for check-in operations
-- Story: 27.3 - Digital Check-In Service
-- Created: 2026-01-10

-- 1. Update status constraint to include checked_in and no_show
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('confirmed', 'pending', 'cancelled', 'completed', 'checked_in', 'no_show'));

-- 2. Add check_in_status and checked_in_at columns
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS check_in_status TEXT DEFAULT 'pending' CHECK (check_in_status IN ('pending', 'checked_in', 'no_show')),
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trip_item_id UUID REFERENCES public.trip_items(id);

-- 3. Add policy for vendors to update bookings
-- A vendor can update a booking if it belongs to one of their experiences
CREATE POLICY "Vendors can update guest bookings for their experiences."
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_items ti
      JOIN public.experiences e ON ti.experience_id = e.id
      JOIN public.vendors v ON e.vendor_id = v.id
      WHERE ti.id = bookings.trip_item_id
      AND v.owner_id = auth.uid()
    )
  );

-- 4. Index for performance
CREATE INDEX IF NOT EXISTS idx_bookings_trip_item ON public.bookings(trip_item_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in_status ON public.bookings(check_in_status);
