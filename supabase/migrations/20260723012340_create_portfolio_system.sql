/*
# Create Portfolio System (single-tenant, no auth)

## Summary
Adds a persistent portfolio system so artwork analyses are saved across sessions.
Each portfolio entry stores the uploaded artwork image, the AI's assigned skill level,
tokens earned, the full feedback text, critique pins (spatial diagnostic data), and
metadata about the medium used. This powers the "Master's Gallery" visual timeline
and the Journey Tracker progression chart.

## New Tables

### portfolio_entries
- `id` (uuid, primary key) — unique entry identifier
- `image_url` (text, not null) — public URL to the artwork image stored in the `artworks` storage bucket
- `image_path` (text, not null) — storage object path within the `artworks` bucket (for deletion)
- `skill_level` (text, not null) — one of: beginner, intermediate, advanced, professional, master
- `tokens_earned` (integer, not null, default 0) — total tokens awarded for this entry
- `feedback` (text, not null) — the AI's markdown feedback text
- `critique_pins` (jsonb, default '[]') — array of {x, y, label, advice} spatial diagnostic pins
- `medium` (text, default 'none') — the preferred medium selected at time of analysis
- `medium_match` (boolean, default false) — whether the artwork matched the preferred medium
- `is_analog` (boolean, default false) — whether AI detected traditional/analog art
- `experimentation_level` (text, default 'low') — high | medium | low
- `created_at` (timestamptz, default now()) — when the entry was created

## Storage
- Creates a public storage bucket named `artworks` for storing uploaded artwork images.
- Sets the bucket to public so the frontend can display images via direct URL.

## Security
- Enables RLS on `portfolio_entries`.
- Adds four CRUD policies (select/insert/update/delete) scoped to `anon, authenticated` since this is a single-tenant app with no sign-in screen. The data is intentionally shared/public.
- Storage bucket policies allow anon uploads, reads, and deletes on the `artworks` bucket.

## Notes
1. This is a single-tenant app — no user_id column, no auth dependency.
2. critique_pins is stored as jsonb for flexible spatial diagnostic data.
3. The artworks bucket is public so portfolio images display without signed URLs.
*/

CREATE TABLE IF NOT EXISTS portfolio_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  image_path text NOT NULL,
  skill_level text NOT NULL,
  tokens_earned integer NOT NULL DEFAULT 0,
  feedback text NOT NULL,
  critique_pins jsonb NOT NULL DEFAULT '[]'::jsonb,
  medium text NOT NULL DEFAULT 'none',
  medium_match boolean NOT NULL DEFAULT false,
  is_analog boolean NOT NULL DEFAULT false,
  experimentation_level text NOT NULL DEFAULT 'low',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_portfolio" ON portfolio_entries;
CREATE POLICY "anon_select_portfolio"
ON portfolio_entries FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_portfolio" ON portfolio_entries;
CREATE POLICY "anon_insert_portfolio"
ON portfolio_entries FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_portfolio" ON portfolio_entries;
CREATE POLICY "anon_update_portfolio"
ON portfolio_entries FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_portfolio" ON portfolio_entries;
CREATE POLICY "anon_delete_portfolio"
ON portfolio_entries FOR DELETE
TO anon, authenticated USING (true);

-- Storage bucket for artwork uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('artworks', 'artworks', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the artworks bucket
DROP POLICY IF EXISTS "anon_upload_artworks" ON storage.objects;
CREATE POLICY "anon_upload_artworks"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'artworks');

DROP POLICY IF EXISTS "anon_read_artworks" ON storage.objects;
CREATE POLICY "anon_read_artworks"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'artworks');

DROP POLICY IF EXISTS "anon_delete_artworks" ON storage.objects;
CREATE POLICY "anon_delete_artworks"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'artworks');
