/*
  # Climate Ninja - Leaderboard Schema

  ## Overview
  Creates the leaderboard and global stats tables for the Climate Ninja game.

  ## New Tables

  ### 1. leaderboard
  Stores player high scores submitted after each game.
  - `id` (uuid, primary key) - Unique record identifier
  - `player_name` (text) - Player's display name (1-20 chars)
  - `score` (integer) - Final score achieved
  - `items_sliced` (integer) - Total pollutant objects sliced
  - `max_combo` (integer) - Highest combo achieved in the game
  - `created_at` (timestamptz) - When the score was submitted

  ## Security
  - RLS enabled on all tables
  - Public users can READ the leaderboard (for displaying top scores)
  - Public users can INSERT new scores (anonymous gameplay)
  - No UPDATE or DELETE allowed (scores are permanent records)

  ## Notes
  - player_name is limited to 20 characters to keep leaderboard clean
  - score must be non-negative
  - No authentication required to submit or view scores (public game)
*/

CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL CHECK (char_length(player_name) >= 1 AND char_length(player_name) <= 20),
  score integer NOT NULL DEFAULT 0 CHECK (score >= 0),
  items_sliced integer NOT NULL DEFAULT 0 CHECK (items_sliced >= 0),
  max_combo integer NOT NULL DEFAULT 0 CHECK (max_combo >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard scores"
  ON leaderboard FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can submit a new score"
  ON leaderboard FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(player_name) >= 1
    AND char_length(player_name) <= 20
    AND score >= 0
    AND items_sliced >= 0
    AND max_combo >= 0
  );
