-- Epic 4: Personalized Recommendations
-- Story 4.4: Recommendation Scoring Engine

-- Create recommendations_log table for tracking recommendation scores
CREATE TABLE IF NOT EXISTS public.recommendations_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  
  -- Scoring breakdown
  score_total INTEGER NOT NULL,
  score_difficulty INTEGER DEFAULT 0,
  score_tags INTEGER DEFAULT 0,
  score_price INTEGER DEFAULT 0,
  score_group_size INTEGER DEFAULT 0,
  
  -- Context for ML training
  user_travel_style TEXT[],
  user_group_type TEXT,
  user_budget_level TEXT,
  experience_difficulty TEXT,
  experience_tags TEXT[],
  experience_price NUMERIC,
  
  -- Metadata
  recommended BOOLEAN DEFAULT false,  -- Was this experience shown as "Perfect for you"?
  clicked BOOLEAN DEFAULT false,  -- Did user click on this recommendation?
  booked BOOLEAN DEFAULT false,  -- Did user book this experience?
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recommendations_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own recommendation logs"
  ON public.recommendations_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert recommendation logs"
  ON public.recommendations_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service can update recommendation logs"
  ON public.recommendations_log
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for analytics queries
CREATE INDEX idx_recommendations_log_user_id ON public.recommendations_log(user_id);
CREATE INDEX idx_recommendations_log_experience_id ON public.recommendations_log(experience_id);
CREATE INDEX idx_recommendations_log_recommended ON public.recommendations_log(recommended) WHERE recommended = true;
CREATE INDEX idx_recommendations_log_booked ON public.recommendations_log(booked) WHERE booked = true;
CREATE INDEX idx_recommendations_log_created_at ON public.recommendations_log(created_at DESC);

-- Composite index for user-experience lookup
CREATE INDEX idx_recommendations_log_user_experience ON public.recommendations_log(user_id, experience_id);

-- Add comment for documentation
COMMENT ON TABLE public.recommendations_log IS 'Logs recommendation scores for ML model improvements (Epic 4, Story 4.4)';
COMMENT ON COLUMN public.recommendations_log.score_total IS 'Sum of all scoring components';
COMMENT ON COLUMN public.recommendations_log.recommended IS 'True if shown as "Perfect for you" (top 3 in category)';
COMMENT ON COLUMN public.recommendations_log.clicked IS 'True if user clicked/viewed the experience';
COMMENT ON COLUMN public.recommendations_log.booked IS 'True if user booked this experience';
