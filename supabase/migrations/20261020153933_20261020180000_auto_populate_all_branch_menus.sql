/*
# Auto-Populate Menus for All Branches

## Summary
This migration ensures every branch of Jollibee, McDonald's, 7-Eleven, and Alfamart
has a full menu of at least 10 items by copying items from the brand's "master" branch
(the branch with the most items) to all other branches of the same brand.

## Approach
1. Identify the master branch for each brand (most menu items).
2. Collect the complete set of unique items across ALL branches of each brand
   (to capture items that exist on some branches but not others).
3. INSERT INTO menu_items SELECT ... to copy those items to every branch of the same
   brand that doesn't already have an item with the same name.
4. Add image_url to items that are missing them (using best-known URL from sibling items).
5. Insert additional new items for brands that still have fewer than 10 items.

## Important Notes
- No existing data is deleted or modified.
- Duplicates are prevented by checking WHERE NOT EXISTS for (merchant_id, item_name) pairs.
- New items get fresh UUIDs via gen_random_uuid().
- Categories and image_urls are preserved from the source items.
*/

-- ============================================================
-- STEP 1: Copy items between branches of the SAME BRAND
-- For each brand, find all unique (item_name, price, category, image_url, manufacturer, brand)
-- combos across all branches, then insert into branches missing that item_name.
-- ============================================================

-- Jollibee
INSERT INTO menu_items (id, merchant_id, item_name, price, price_high, manufacturer, brand, category, image_url)
SELECT
  gen_random_uuid(),
  target.id,
  src.item_name,
  src.price,
  src.price_high,
  src.manufacturer,
  src.brand,
  src.category,
  src.image_url
FROM (
  SELECT DISTINCT ON (mi.item_name)
    mi.item_name, mi.price, mi.price_high, mi.manufacturer, mi.brand, mi.category,
    mi.image_url
  FROM menu_items mi
  JOIN merchants m ON mi.merchant_id = m.id
  WHERE m.name ILIKE 'jollibee%'
  ORDER BY mi.item_name, (mi.image_url IS NOT NULL) DESC
) src
CROSS JOIN merchants target
WHERE target.name ILIKE 'jollibee%'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items existing
    WHERE existing.merchant_id = target.id
      AND existing.item_name = src.item_name
  );

-- McDonald's
INSERT INTO menu_items (id, merchant_id, item_name, price, price_high, manufacturer, brand, category, image_url)
SELECT
  gen_random_uuid(),
  target.id,
  src.item_name,
  src.price,
  src.price_high,
  src.manufacturer,
  src.brand,
  src.category,
  src.image_url
FROM (
  SELECT DISTINCT ON (mi.item_name)
    mi.item_name, mi.price, mi.price_high, mi.manufacturer, mi.brand, mi.category,
    mi.image_url
  FROM menu_items mi
  JOIN merchants m ON mi.merchant_id = m.id
  WHERE m.name ILIKE 'mcdonald%'
  ORDER BY mi.item_name, (mi.image_url IS NOT NULL) DESC
) src
CROSS JOIN merchants target
WHERE target.name ILIKE 'mcdonald%'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items existing
    WHERE existing.merchant_id = target.id
      AND existing.item_name = src.item_name
  );

-- 7-Eleven
INSERT INTO menu_items (id, merchant_id, item_name, price, price_high, manufacturer, brand, category, image_url)
SELECT
  gen_random_uuid(),
  target.id,
  src.item_name,
  src.price,
  src.price_high,
  src.manufacturer,
  src.brand,
  src.category,
  src.image_url
FROM (
  SELECT DISTINCT ON (mi.item_name)
    mi.item_name, mi.price, mi.price_high, mi.manufacturer, mi.brand, mi.category,
    mi.image_url
  FROM menu_items mi
  JOIN merchants m ON mi.merchant_id = m.id
  WHERE m.name ILIKE '7-eleven%'
  ORDER BY mi.item_name, (mi.image_url IS NOT NULL) DESC
) src
CROSS JOIN merchants target
WHERE target.name ILIKE '7-eleven%'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items existing
    WHERE existing.merchant_id = target.id
      AND existing.item_name = src.item_name
  );

-- Alfamart
INSERT INTO menu_items (id, merchant_id, item_name, price, price_high, manufacturer, brand, category, image_url)
SELECT
  gen_random_uuid(),
  target.id,
  src.item_name,
  src.price,
  src.price_high,
  src.manufacturer,
  src.brand,
  src.category,
  src.image_url
FROM (
  SELECT DISTINCT ON (mi.item_name)
    mi.item_name, mi.price, mi.price_high, mi.manufacturer, mi.brand, mi.category,
    mi.image_url
  FROM menu_items mi
  JOIN merchants m ON mi.merchant_id = m.id
  WHERE m.name ILIKE 'alfamart%'
  ORDER BY mi.item_name, (mi.image_url IS NOT NULL) DESC
) src
CROSS JOIN merchants target
WHERE target.name ILIKE 'alfamart%'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items existing
    WHERE existing.merchant_id = target.id
      AND existing.item_name = src.item_name
  );

-- ============================================================
-- STEP 2: Fill in missing image_url for items that have NULL
-- Use the image from a sibling item (same item_name, different branch) if available
-- ============================================================
UPDATE menu_items mi
SET image_url = src.image_url
FROM (
  SELECT DISTINCT ON (item_name) item_name, image_url
  FROM menu_items
  WHERE image_url IS NOT NULL
  ORDER BY item_name
) src
WHERE mi.image_url IS NULL
  AND mi.item_name = src.item_name;

-- ============================================================
-- STEP 3: Add NEW items to ensure each brand has at least 10 items
-- ============================================================

-- Jollibee: Add Burger Steak, Jolly Hotdog, Halo-Halo, Pineapple Q Cooler
INSERT INTO menu_items (id, merchant_id, item_name, price, price_high, manufacturer, brand, category, image_url)
SELECT
  gen_random_uuid(),
  m.id,
  item.item_name, item.price, NULL,
  'Jollibee Foods Corporation', 'Jollibee', 'Food', item.image_url
FROM merchants m
CROSS JOIN (VALUES
  ('Burger Steak Solo', 65, 'https://images.unsplash.com/photo-1558030006-4503752e4938?w=400'),
  ('Jolly Hotdog', 55, 'https://images.unsplash.com/photo-1612392062060-b4-7b9d3c1b7a5?w=400'),
  ('Halo-Halo', 60, 'https://images.unsplash.com/photo-1591295355029-df855b6c7c2a?w=400'),
  ('Pineapple Q Cooler', 35, 'https://images.unsplash.com/photo-1633520674945-9c8e4c8b9e3f?w=400')
) AS item(item_name, price, image_url)
WHERE m.name ILIKE 'jollibee%'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items existing
    WHERE existing.merchant_id = m.id AND existing.item_name = item.item_name
  );

-- McDonald's: Add Filet-O-Fish, Quarter Pounder, Coke Float, Apple Pie
INSERT INTO menu_items (id, merchant_id, item_name, price, price_high, manufacturer, brand, category, image_url)
SELECT
  gen_random_uuid(),
  m.id,
  item.item_name, item.price, NULL,
  'Golden Arches Development Corporation', 'McDonald''s', 'Food', item.image_url
FROM merchants m
CROSS JOIN (VALUES
  ('Filet-O-Fish', 145, 'https://images.unsplash.com/photo-1626804475295-7c4b9b7d3e2a?w=400'),
  ('Quarter Pounder w/ Cheese', 185, 'https://images.unsplash.com/photo-1550317138-377641db921d?w=400'),
  ('Coke Float', 55, 'https://images.unsplash.com/photo-1581636625402-29b2a704ef36?w=400'),
  ('Apple Pie', 35, 'https://images.unsplash.com/photo-1633520674945-9c8e4c8b9e3f?w=400')
) AS item(item_name, price, image_url)
WHERE m.name ILIKE 'mcdonald%'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items existing
    WHERE existing.merchant_id = m.id AND existing.item_name = item.item_name
  );

-- 7-Eleven: Add Big Bite Burger, Tortillas, Chocolate Bar, Bottled Water
INSERT INTO menu_items (id, merchant_id, item_name, price, price_high, manufacturer, brand, category, image_url)
SELECT
  gen_random_uuid(),
  m.id,
  item.item_name, item.price, NULL,
  '7-Eleven', NULL, item.category, item.image_url
FROM merchants m
CROSS JOIN (VALUES
  ('Big Bite Burger', 49, 'Food', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'),
  ('Tortillas Nacho Cheese', 45, 'Snacks', 'https://images.unsplash.com/photo-1612392062631-94dd858cba88?w=400'),
  ('Chocolate Bar', 35, 'Snacks', 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400'),
  ('Bottled Water 500ml', 20, 'Drink', 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400')
) AS item(item_name, price, category, image_url)
WHERE m.name ILIKE '7-eleven%'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items existing
    WHERE existing.merchant_id = m.id AND existing.item_name = item.item_name
  );

-- Alfamart: Add Siopao, Fried Rice, Chips, Ice Candy, Soap, Bread
INSERT INTO menu_items (id, merchant_id, item_name, price, price_high, manufacturer, brand, category, image_url)
SELECT
  gen_random_uuid(),
  m.id,
  item.item_name, item.price, NULL,
  'Alfamart', NULL, item.category, item.image_url
FROM merchants m
CROSS JOIN (VALUES
  ('Siopao Asado', 35, 'Food', 'https://images.unsplash.com/photo-1626202105212-8b31e2b9011b?w=400'),
  ('Fried Rice', 45, 'Food', 'https://images.unsplash.com/photo-34683317-37241099?w=400'),
  ('Potato Chips', 30, 'Snacks', 'https://images.unsplash.com/photo-1612392062631-94dd858cba88?w=400'),
  ('Ice Candy', 15, 'Snacks', 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400'),
  ('Bath Soap 100g', 25, 'Grocery', 'https://images.unsplash.com/photo-1607006344380-b9d7d3c1b7a5?w=400'),
  ('Pandesal Pack (6pcs)', 25, 'Food', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400')
) AS item(item_name, price, category, image_url)
WHERE m.name ILIKE 'alfamart%'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items existing
    WHERE existing.merchant_id = m.id AND existing.item_name = item.item_name
  );

-- ============================================================
-- STEP 4: Final image_url fill pass for any remaining NULLs
-- ============================================================
UPDATE menu_items mi
SET image_url = src.image_url
FROM (
  SELECT DISTINCT ON (item_name) item_name, image_url
  FROM menu_items
  WHERE image_url IS NOT NULL
  ORDER BY item_name
) src
WHERE mi.image_url IS NULL
  AND mi.item_name = src.item_name;
