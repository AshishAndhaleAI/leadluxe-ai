-- ============================================================
-- LeadLuxe AI — User Preferences Migration
-- Stores per-user coach preferences for cross-device sync.
-- ============================================================

-- Create user_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences (user_id);

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own preferences
DROP POLICY IF EXISTS "Users can read own preferences" ON public.user_preferences;
CREATE POLICY "Users can read own preferences"
  ON public.user_preferences
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id = auth.uid()::text);

-- Allow users to insert their own preferences
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences
  FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id = auth.uid()::text);

-- Allow users to update their own preferences
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences"
  ON public.user_preferences
  FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id = auth.uid()::text)
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id = auth.uid()::text);

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER trg_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_preferences_updated_at();

-- Comment on table
COMMENT ON TABLE public.user_preferences IS 'Stores per-user AI Coach preferences for cross-device sync.';
COMMENT ON COLUMN public.user_preferences.preferences IS 'JSON object matching the CoachPreferences interface from coach-preferences.ts';
