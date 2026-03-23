# Storage Setup Guide

The `profile-avatars` bucket needs to be created in your Supabase project. Choose one of the methods below:

## Method 1: Using Supabase Dashboard (Easiest)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click on **Storage** in the left sidebar
4. Click **Create a new bucket**
5. Name it: `profile-avatars`
6. Enable **Public bucket** (toggle ON)
7. Click **Create bucket**

## Method 2: Using Supabase CLI

Run this command in your project directory:

```bash
supabase link  # if not already linked
supabase db push
```

This will apply all migrations including the bucket creation.

## Method 3: Using SQL Editor

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Paste this SQL:

```sql
-- Create profile-avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-avatars', 'profile-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up policies
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
```

5. Click **Run**

## Verification

After completing any of the above steps:

1. Go to **Storage** in your Supabase Dashboard
2. You should see the `profile-avatars` bucket listed
3. Return to your app and try uploading a profile picture in Settings

---

**That's it!** Once the bucket is created, the profile picture feature will work automatically. Your photos will be saved and appear whenever your camera is off in video calls.
