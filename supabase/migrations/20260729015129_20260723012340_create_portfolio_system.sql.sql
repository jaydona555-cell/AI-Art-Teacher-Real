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

INSERT INTO storage.buckets (id, name, public)
VALUES ('artworks', 'artworks', true)
ON CONFLICT (id) DO NOTHING;

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