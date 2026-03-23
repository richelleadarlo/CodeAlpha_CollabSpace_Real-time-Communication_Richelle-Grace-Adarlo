-- Add email to profiles to support invite-by-email lookup
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Keep email unique (case-insensitive) for reliable lookup
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_idx
ON public.profiles (lower(email))
WHERE email IS NOT NULL;

-- Backfill existing profiles from auth users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id
  AND p.email IS NULL;

-- Update signup trigger to also store user email in profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-avatars', 'profile-avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload own profile avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile avatars" ON storage.objects;

CREATE POLICY "Users can upload own profile avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own profile avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'profile-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public can view profile avatars" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'profile-avatars');

-- Room invites table
CREATE TABLE IF NOT EXISTS public.room_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, invited_user_id)
);

ALTER TABLE public.room_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Invites viewable by inviter or invitee" ON public.room_invites;
DROP POLICY IF EXISTS "Room participants can invite users" ON public.room_invites;
DROP POLICY IF EXISTS "Invitees can respond or inviter can resend" ON public.room_invites;

CREATE POLICY "Invites viewable by inviter or invitee" ON public.room_invites
  FOR SELECT TO authenticated
  USING (auth.uid() = invited_user_id OR auth.uid() = invited_by);

CREATE POLICY "Room participants can invite users" ON public.room_invites
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = invited_by
    AND auth.uid() <> invited_user_id
    AND EXISTS (
      SELECT 1
      FROM public.room_participants rp
      WHERE rp.room_id = room_invites.room_id
        AND rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Invitees can respond or inviter can resend" ON public.room_invites
  FOR UPDATE TO authenticated
  USING (auth.uid() = invited_user_id OR auth.uid() = invited_by)
  WITH CHECK (auth.uid() = invited_user_id OR auth.uid() = invited_by);

DROP TRIGGER IF EXISTS update_room_invites_updated_at ON public.room_invites;

CREATE TRIGGER update_room_invites_updated_at
  BEFORE UPDATE ON public.room_invites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.room_invites;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
