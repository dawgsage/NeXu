/*
# NeXu Shopping List & Product Photos Storage

## Overview
Adds a shopping_list table for the "Shop & Deliver" feature and a public storage
bucket for product proof photos. Seeds 3 dummy items linked to an existing order.

## New Tables

### shopping_list
- id (uuid, primary key)
- order_id (uuid, references orders.id on delete cascade)
- item_name (text) — name of the item to shop
- barcode (text, nullable) — known barcode if provided
- is_scanned (boolean, default false) — true once driver scans or photographs
- proof_image_url (text, nullable) — public URL of uploaded proof photo
- created_at (timestamptz)

## Storage
- Creates a PUBLIC bucket `product_photos` for proof images.
- Adds storage policies allowing anon+authenticated to read and upload.

## Seed Data
- Links 3 items (Milk, Bananas, Bread) to the most recent available order.
*/

CREATE TABLE IF NOT EXISTS shopping_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  barcode text,
  is_scanned boolean NOT NULL DEFAULT false,
  proof_image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_shopping_list" ON shopping_list;
CREATE POLICY "anon_select_shopping_list" ON shopping_list FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_shopping_list" ON shopping_list;
CREATE POLICY "anon_insert_shopping_list" ON shopping_list FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_shopping_list" ON shopping_list;
CREATE POLICY "anon_update_shopping_list" ON shopping_list FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_shopping_list" ON shopping_list;
CREATE POLICY "anon_delete_shopping_list" ON shopping_list FOR DELETE
  TO anon, authenticated USING (true);

-- Create public storage bucket for product photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('product_photos', 'product_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: allow anon+authenticated to read and upload
DROP POLICY IF EXISTS "anon_read_product_photos" ON storage.objects;
CREATE POLICY "anon_read_product_photos" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product_photos');

DROP POLICY IF EXISTS "anon_upload_product_photos" ON storage.objects;
CREATE POLICY "anon_upload_product_photos" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'product_photos');

-- Seed 3 dummy items linked to an existing order
DO $$
DECLARE
  target_order_id uuid;
BEGIN
  SELECT id INTO target_order_id FROM orders WHERE status = 'Available' ORDER BY created_at DESC LIMIT 1;
  IF target_order_id IS NOT NULL THEN
    INSERT INTO shopping_list (order_id, item_name, barcode, is_scanned)
    VALUES
      (target_order_id, 'Milk', '4800550710017', false),
      (target_order_id, 'Bananas', NULL, false),
      (target_order_id, 'Bread', '4800116170012', false)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
