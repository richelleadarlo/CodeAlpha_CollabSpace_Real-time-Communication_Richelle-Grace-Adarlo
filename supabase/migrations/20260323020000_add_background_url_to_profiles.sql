-- Add background_url column to profiles for custom dashboard backgrounds
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS background_url TEXT;
