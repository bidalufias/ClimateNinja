# Database Schema - Climate Ninja

## Tables

### leaderboard

Stores player high scores submitted after each game session.

| Column | Type | Default | Constraints | Description |
|---|---|---|---|---|
| `id` | uuid | `gen_random_uuid()` | PRIMARY KEY | Unique record identifier |
| `player_name` | text | — | NOT NULL, 1-20 chars | Player's display name |
| `score` | integer | `0` | NOT NULL, >= 0 | Final score achieved |
| `items_sliced` | integer | `0` | NOT NULL, >= 0 | Total pollutant objects sliced |
| `max_combo` | integer | `0` | NOT NULL, >= 0 | Highest combo achieved in the game |
| `created_at` | timestamptz | `now()` | NOT NULL | When the score was submitted |

## Row Level Security (RLS) Policies

### leaderboard

RLS is **enabled** on this table.

| Policy Name | Operation | Role | Rule |
|---|---|---|---|
| Anyone can view leaderboard scores | SELECT | anon, authenticated | `USING (true)` |
| Anyone can submit a new score | INSERT | anon, authenticated | `WITH CHECK (char_length(player_name) >= 1 AND char_length(player_name) <= 20 AND score >= 0 AND items_sliced >= 0 AND max_combo >= 0)` |

**Notes:**
- No UPDATE or DELETE policies exist — scores are permanent records
- Public read access is intentional for displaying global leaderboard to all players
- Public insert is allowed since the game requires no authentication
- Data integrity is enforced at the database level via CHECK constraints
