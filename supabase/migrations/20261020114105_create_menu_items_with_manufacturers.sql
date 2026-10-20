/*
# NeXu Menu Items — Manufacturer & Brand Data

## Overview
Creates a `menu_items` table linked to merchants, with manufacturer and brand columns.
Seeds real 2026 PH fast food, grocery, convenience store, pharmacy, and karenderia prices.

## New Tables

### menu_items
- id (uuid, primary key)
- merchant_id (uuid, references merchants on delete cascade)
- item_name (text) — display name
- price (numeric) — current price in PHP
- price_high (numeric, nullable) — upper bound for price ranges
- manufacturer (text) — company that produces the item
- brand (text, nullable) — house brand vs premium brand distinction
- category (text) — food/grocery/drink/pharmacy classification
- created_at (timestamptz)

## New Merchants
- McDonald's, Chowking, Mang Inasal, 7-Eleven, Mercury Drug, Karenderia ni Aling Nena
*/

-- Add new merchants for the menu items
INSERT INTO merchants (name, category, lat, lng, is_active) VALUES
  ('McDonald''s Malolos', 'Restaurant', 14.854, 120.815, true),
  ('Chowking Malolos', 'Restaurant', 14.850, 120.810, true),
  ('Mang Inasal Malolos', 'Restaurant', 14.848, 120.812, true),
  ('7-Eleven Malolos Bayan', 'Grocery', 14.845, 120.812, true),
  ('Mercury Drug Malolos', 'Grocery', 14.846, 120.810, true),
  ('Karenderia ni Aling Nena', 'Restaurant', 14.843, 120.808, true)
ON CONFLICT DO NOTHING;

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES merchants(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  price_high numeric,
  manufacturer text NOT NULL DEFAULT '',
  brand text,
  category text NOT NULL DEFAULT 'Food',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_menu_items" ON menu_items;
CREATE POLICY "anon_select_menu_items" ON menu_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_menu_items" ON menu_items;
CREATE POLICY "anon_insert_menu_items" ON menu_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_menu_items" ON menu_items;
CREATE POLICY "anon_update_menu_items" ON menu_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_menu_items" ON menu_items;
CREATE POLICY "anon_delete_menu_items" ON menu_items FOR DELETE
  TO anon, authenticated USING (true);

-- Seed all menu items
DO $$
DECLARE
  jollibee_id uuid; mcdonalds_id uuid; chowking_id uuid; mang_inasal_id uuid;
  seveneleven_id uuid; mercury_id uuid; karenderia_id uuid;
  puregold_id uuid; sm_id uuid; robinsons_id uuid;
BEGIN
  SELECT id INTO jollibee_id FROM merchants WHERE name = 'Jollibee Malolos Bayan';
  SELECT id INTO mcdonalds_id FROM merchants WHERE name = 'McDonald''s Malolos';
  SELECT id INTO chowking_id FROM merchants WHERE name = 'Chowking Malolos';
  SELECT id INTO mang_inasal_id FROM merchants WHERE name = 'Mang Inasal Malolos';
  SELECT id INTO seveneleven_id FROM merchants WHERE name = '7-Eleven Malolos Bayan';
  SELECT id INTO mercury_id FROM merchants WHERE name = 'Mercury Drug Malolos';
  SELECT id INTO karenderia_id FROM merchants WHERE name = 'Karenderia ni Aling Nena';
  SELECT id INTO puregold_id FROM merchants WHERE name = 'Puregold Parañaque';
  SELECT id INTO sm_id FROM merchants WHERE name = 'SM City San Jose del Monte';
  SELECT id INTO robinsons_id FROM merchants WHERE name = 'Ayala Malls Manila Bay';

  -- JOLLIBEE
  INSERT INTO menu_items (merchant_id, item_name, price, manufacturer, brand, category) VALUES
    (jollibee_id, 'Chickenjoy Solo w/ Rice', 106, 'Jollibee Foods Corporation', 'Jollibee', 'Food'),
    (jollibee_id, 'Yumburger Solo', 56, 'Jollibee Foods Corporation', 'Jollibee', 'Food'),
    (jollibee_id, 'Jolly Spaghetti', 55, 'Jollibee Foods Corporation', 'Jollibee', 'Food'),
    (jollibee_id, '1-pc Chickenjoy w/ Fries Solo', 164, 'Jollibee Foods Corporation', 'Jollibee', 'Food'),
    (jollibee_id, 'Super Meal A (Chickenjoy + Spaghetti + Yumburger + Rice + Drink)', 185, 'Jollibee Foods Corporation', 'Jollibee', 'Food'),
    (jollibee_id, 'Peach Mango Pie', 45, 'Jollibee Foods Corporation', 'Jollibee', 'Food');

  -- MCDONALD'S
  INSERT INTO menu_items (merchant_id, item_name, price, manufacturer, brand, category) VALUES
    (mcdonalds_id, '1-pc Chicken McDo w/ Rice + Drink', 99, 'Golden Arches Development Corporation', 'McDonald''s', 'Food'),
    (mcdonalds_id, '1-pc Chicken McDo Solo', 96, 'Golden Arches Development Corporation', 'McDonald''s', 'Food'),
    (mcdonalds_id, 'Chicken McDo w/ Fries Small Meal', 168, 'Golden Arches Development Corporation', 'McDonald''s', 'Food'),
    (mcdonalds_id, '1-pc Spicy Chicken McDo w/ Small Fries & Drink', 175, 'Golden Arches Development Corporation', 'McDonald''s', 'Food'),
    (mcdonalds_id, '10-pc Chicken McNuggets', 199, 'Golden Arches Development Corporation', 'McDonald''s', 'Food'),
    (mcdonalds_id, 'Medium Fries', 95, 'Golden Arches Development Corporation', 'McDonald''s', 'Food');

  -- CHOWKING
  INSERT INTO menu_items (merchant_id, item_name, price, manufacturer, brand, category) VALUES
    (chowking_id, 'Chinese-Style Fried Chicken', 99, 'Jollibee Foods Corporation', 'Chowking', 'Food'),
    (chowking_id, 'Chao Fan', 85, 'Jollibee Foods Corporation', 'Chowking', 'Food');

  -- MANG INASAL
  INSERT INTO menu_items (merchant_id, item_name, price, manufacturer, brand, category) VALUES
    (mang_inasal_id, 'PM1 Chicken Inasal', 120, 'Jollibee Foods Corporation', 'Mang Inasal', 'Food'),
    (mang_inasal_id, 'PM2 Chicken Inasal', 180, 'Jollibee Foods Corporation', 'Mang Inasal', 'Food');

  -- 7-ELEVEN
  INSERT INTO menu_items (merchant_id, item_name, price, manufacturer, brand, category) VALUES
    (seveneleven_id, 'Slurpee Mini', 15, 'Philippine Seven Corporation', '7-Eleven', 'Drink'),
    (seveneleven_id, 'Slurpee Regular', 35, 'Philippine Seven Corporation', '7-Eleven', 'Drink'),
    (seveneleven_id, 'Slurpee Medium', 39, 'Philippine Seven Corporation', '7-Eleven', 'Drink'),
    (seveneleven_id, 'Slurpee Large', 49, 'Philippine Seven Corporation', '7-Eleven', 'Drink'),
    (seveneleven_id, 'City Café Iced Latte', 75, 'Philippine Seven Corporation', '7-Eleven', 'Drink'),
    (seveneleven_id, 'Slurpee Donut', 55, 'Philippine Seven Corporation', '7-Eleven', 'Food');

  -- MERCURY DRUG
  INSERT INTO menu_items (merchant_id, item_name, price, manufacturer, brand, category) VALUES
    (mercury_id, 'Biogesic 500mg (per tablet)', 5, 'UNILAB', 'Biogesic', 'Pharmacy'),
    (mercury_id, 'Biogesic 500mg (10 tablets)', 50, 'UNILAB', 'Biogesic', 'Pharmacy'),
    (mercury_id, 'Biogesic 500mg (20 tablets)', 95, 'UNILAB', 'Biogesic', 'Pharmacy');

  -- KARENDERIA NI ALING NENA
  INSERT INTO menu_items (merchant_id, item_name, price, manufacturer, brand, category) VALUES
    (karenderia_id, 'Pork Adobo w/ Rice', 80, 'Local / Home-cooked', 'Aling Nena', 'Food'),
    (karenderia_id, 'Chicken Tinola w/ Rice', 85, 'Local / Home-cooked', 'Aling Nena', 'Food'),
    (karenderia_id, 'Pancit Bihon', 70, 'Local / Home-cooked', 'Aling Nena', 'Food'),
    (karenderia_id, 'Lumpia (4pcs)', 50, 'Local / Home-cooked', 'Aling Nena', 'Food');

  -- GROCERY: RICE (with price ranges across 3 stores)
  INSERT INTO menu_items (merchant_id, item_name, price, price_high, manufacturer, brand, category) VALUES
    (puregold_id, 'White Rice 5kg (Economy)', 195, 225, 'Various', 'Harvester / Economy', 'Grocery'),
    (sm_id, 'White Rice 5kg (Economy)', 205, 235, 'Various', 'Harvester / Economy', 'Grocery'),
    (robinsons_id, 'White Rice 5kg (Economy)', 210, 240, 'Various', 'Harvester / Economy', 'Grocery'),
    (puregold_id, 'White Rice 1kg (Regular Milled)', 40, 50, 'Various', 'Economy', 'Grocery'),
    (sm_id, 'White Rice 1kg (Regular Milled)', 42, 52, 'Various', 'Economy', 'Grocery'),
    (robinsons_id, 'White Rice 1kg (Regular Milled)', 45, 55, 'Various', 'Economy', 'Grocery'),
    (puregold_id, 'Well-Milled Rice 1kg', 46, 56, 'Various', 'Premium', 'Grocery'),
    (sm_id, 'Well-Milled Rice 1kg', 48, 58, 'Various', 'Premium', 'Grocery'),
    (robinsons_id, 'Well-Milled Rice 1kg', 50, 60, 'Various', 'Premium', 'Grocery');

  -- GROCERY: COOKING OIL (house brand vs premium)
  INSERT INTO menu_items (merchant_id, item_name, price, manufacturer, brand, category) VALUES
    (puregold_id, 'Cooking Oil 1L (House Brand)', 80, 'Various', 'House Brand', 'Grocery'),
    (sm_id, 'Cooking Oil 1L (House Brand)', 85, 'Various', 'House Brand', 'Grocery'),
    (robinsons_id, 'Cooking Oil 1L (House Brand)', 88, 'Various', 'House Brand', 'Grocery'),
    (puregold_id, 'Cooking Oil 1L (Premium - Baguio Oil)', 120, 'Baguio Oil', 'Premium', 'Grocery'),
    (sm_id, 'Cooking Oil 1L (Premium - Baguio Oil)', 125, 'Baguio Oil', 'Premium', 'Grocery'),
    (robinsons_id, 'Cooking Oil 1L (Premium - Baguio Oil)', 130, 'Baguio Oil', 'Premium', 'Grocery');

  -- GROCERY: EGGS
  INSERT INTO menu_items (merchant_id, item_name, price, manufacturer, brand, category) VALUES
    (puregold_id, 'Fresh Eggs (Tray of 30)', 220, 'Various Farms', 'Farm Fresh', 'Grocery'),
    (sm_id, 'Fresh Eggs (Tray of 30)', 230, 'Various Farms', 'Farm Fresh', 'Grocery'),
    (robinsons_id, 'Fresh Eggs (Tray of 30)', 235, 'Various Farms', 'Farm Fresh', 'Grocery');

  -- GROCERY: SOFT DRINKS
  INSERT INTO menu_items (merchant_id, item_name, price, manufacturer, brand, category) VALUES
    (puregold_id, 'Coca-Cola 1.5L', 75, 'Coca-Cola Beverages Philippines', 'Coca-Cola', 'Grocery'),
    (sm_id, 'Coca-Cola 1.5L', 78, 'Coca-Cola Beverages Philippines', 'Coca-Cola', 'Grocery'),
    (robinsons_id, 'Coca-Cola 1.5L', 80, 'Coca-Cola Beverages Philippines', 'Coca-Cola', 'Grocery');
END $$;
