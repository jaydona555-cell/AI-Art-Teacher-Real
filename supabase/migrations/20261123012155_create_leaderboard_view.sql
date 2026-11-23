/*
# Create leaderboard_stats view for art skill rankings

1. New Views
- `leaderboard_stats` — a read-only view that aggregates portfolio_entries
  into per-entry skill rankings. Each row represents one artwork submission
  with its skill level, tokens earned, medium, and creation date.

2. How it works
- Selects from portfolio_entries (the existing single-tenant table).
- Exposes: id, skill_level, tokens_earned, medium, medium_match,
  is_analog, experimentation_level, created_at.
- Does NOT expose feedback or critique_pins (private critique data).
- The frontend will ORDER BY tokens_earned DESC to build the ranking.

3. Security
- This is a single-tenant app with no sign-in.
- Views in Supabase inherit RLS from their underlying tables, so
  the view is protected by portfolio_entries' existing RLS policies.
- Grant SELECT to anon + authenticated so the Data API can reach it.

4. Important notes
- No new tables are created — this is a read-only view on existing data.
- Safe to re-run (CREATE OR REPLACE).
*/

CREATE OR REPLACE VIEW leaderboard_stats AS
SELECT
  id,
  skill_level,
  tokens_earned,
  medium,
  medium_match,
  is_analog,
  experimentation_level,
  created_at
FROM portfolio_entries
ORDER BY tokens_earned DESC;

GRANT SELECT ON leaderboard_stats TO anon, authenticated;
