-- Add missing columns to profiles table for user settings persistence
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS saved TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

-- Add RLS policies for these columns if needed (existing policy likely covers access to 'all' or specific columns, usually 'all' for owner)
-- Assuming existing policy is "Users can update own profile"
