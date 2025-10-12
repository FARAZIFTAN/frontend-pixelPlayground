/*
  # Create Photos Table

  1. New Tables
    - `photos`
      - `id` (uuid, primary key) - Unique identifier for each photo
      - `user_id` (uuid, nullable) - Reference to auth.users, nullable for guest photos
      - `image_data` (text) - Base64 encoded image data
      - `frame` (text, nullable) - Selected frame identifier
      - `filter` (text, nullable) - Selected filter identifier
      - `created_at` (timestamptz) - Timestamp when photo was created

  2. Security
    - Enable RLS on `photos` table
    - Add policy for users to read their own photos
    - Add policy for users to insert their own photos
    - Add policy for users to delete their own photos
    - Add policy for authenticated users to update their own photos

  3. Important Notes
    - user_id is nullable to allow guest users to use the app without authentication
    - Guests can store photos locally in browser storage
    - Authenticated users' photos are stored in the database
*/

CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  image_data text NOT NULL,
  frame text,
  filter text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own photos"
  ON photos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos"
  ON photos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON photos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own photos"
  ON photos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS photos_user_id_idx ON photos(user_id);
CREATE INDEX IF NOT EXISTS photos_created_at_idx ON photos(created_at DESC);
