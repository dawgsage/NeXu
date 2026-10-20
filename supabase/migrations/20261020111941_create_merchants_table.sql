/*
# NeXu Merchants Table

## Overview
Adds a merchants table for real-time restaurant/store/landmark availability.

## New Tables

### merchants
- id (uuid, primary key)
- name (text) — merchant display name
- category (text) — Restaurant | Grocery | Mall
- lat (numeric) — latitude
- lng (numeric) — longitude
- is_active (boolean, default true) — availability toggle
- created_at (timestamptz)

## Security
- RLS enabled. Anon + authenticated full CRUD (shared data, no auth).

## Seed Data
4 real Philippine landmarks across Bulacan, Metro Manila.
*/

CREATE TABLE IF NOT EXISTS merchants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Restaurant',
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_merchants" ON merchants;
CREATE POLICY "anon_select_merchants" ON merchants FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_merchants" ON merchants;
CREATE POLICY "anon_insert_merchants" ON merchants FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_merchants" ON merchants;
CREATE POLICY "anon_update_merchants" ON merchants FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_merchants" ON merchants;
CREATE POLICY "anon_delete_merchants" ON merchants FOR DELETE
  TO anon, authenticated USING (true);

-- Seed 4 Philippine landmarks
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM merchants LIMIT 1) THEN
    INSERT INTO merchants (name, category, lat, lng, is_active) VALUES
      ('Jollibee Malolos Bayan', 'Restaurant', 14.844, 120.811, true),
      ('SM City San Jose del Monte', 'Mall', 14.811, 121.045, true),
      ('Ayala Malls Manila Bay', 'Mall', 14.535, 120.982, true),
      ('Puregold Parañaque', 'Grocery', 14.480, 121.000, true);
  END IF;
END $$;
