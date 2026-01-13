-- Epic 4: User Preferences and Onboarding
-- Story 4.2: Travel Preference Selection
-- Story 4.3: Trip Dates

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Travel preferences from onboarding
  travel_style TEXT[] DEFAULT '{}',  -- ['Adventure', 'Relaxation', 'Culture', 'Mix of Everything']
  group_type TEXT,  -- 'Solo', 'Couple', 'Friends', 'Family'
  budget_level TEXT,  -- 'Budget-Conscious', 'Mid-Range', 'Luxury'
  
  -- Optional trip dates
  trip_start_date DATE,
  trip_end_date DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure one preference record per user
  UNIQUE(user_id)
);

-- Add onboarding_completed flag to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own preferences
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON public.user_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_user_preferences_travel_style ON public.user_preferences USING GIN(travel_style);
CREATE INDEX idx_user_preferences_trip_dates ON public.user_preferences(trip_start_date, trip_end_date);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.user_preferences IS 'Stores user travel preferences from onboarding flow (Epic 4)';
