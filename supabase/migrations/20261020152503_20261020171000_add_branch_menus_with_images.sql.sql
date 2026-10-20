/*
# Add menu items with images for regional branches

## Summary
Inserts menu items with Unsplash image URLs for 7-Eleven, Alfamart, Jollibee,
and McDonald's branch merchants. Items are linked to each specific branch merchant.
Existing items with the same name on the same merchant are left unchanged (no duplicates).

## Menu Items by Brand
- 7-Eleven (7 branches × 5 items = 35 items): Slurpee, Gulp Iced Tea, Siopao Asado, Hotdog Sandwich, City Cafe Iced Latte
- Alfamart (4 branches × 4 items = 16 items): Fried Chicken, Ready-to-drink Coffee, Instant Noodles, Bottled Water
- Jollibee (new branches × 4 items): 1-pc Chickenjoy w/ Rice, Jolly Spaghetti, Yumburger, Peach Mango Pie
- McDonald's (2 branches × 4 items): 1-pc Chicken McDo w/ Rice, Big Mac, Medium Fries, Oreo McFlurry

## Images
All items use the exact Unsplash URLs provided. The image_url column (added in a prior migration) stores these.

## Notes
- For existing Jollibee branches (Jollibee Dagupan, Jollibee Malolos Bayan, Jollibee Marquee, Jollibee MOA),
  the requested items are added if missing (with images).
- No existing data deleted.
*/

-- ============================================================
-- 7-ELEVEN MENU (linked to every 7-Eleven branch)
-- ============================================================
INSERT INTO menu_items (merchant_id, item_name, price, category, manufacturer, brand, image_url)
SELECT m.id, vals.item_name, vals.price, vals.category, vals.manufacturer, vals.brand, vals.image_url
FROM (
  VALUES
    ('Slurpee Large (Coke)', 49, 'Drink', '7-Eleven', NULL, 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400'),
    ('Gulp Iced Tea', 35, 'Drink', '7-Eleven', NULL, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'),
    ('Siopao Asado', 45, 'Snacks', '7-Eleven', NULL, 'https://images.unsplash.com/photo-1626202105212-8b31e2b9011b?w=400'),
    ('Hotdog Sandwich', 40, 'Snacks', '7-Eleven', NULL, 'https://images.unsplash.com/photo-1612392062631-94dd858cba88?w=400'),
    ('City Cafe Iced Latte', 75, 'Drink', '7-Eleven', NULL, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400')
) AS vals(item_name, price, category, manufacturer, brand, image_url)
CROSS JOIN merchants m
WHERE m.name LIKE '7-Eleven%'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items mi WHERE mi.merchant_id = m.id AND mi.item_name = vals.item_name
  );

-- ============================================================
-- ALFAMART MENU (linked to every Alfamart branch)
-- ============================================================
INSERT INTO menu_items (merchant_id, item_name, price, category, manufacturer, brand, image_url)
SELECT m.id, vals.item_name, vals.price, vals.category, vals.manufacturer, vals.brand, vals.image_url
FROM (
  VALUES
    ('Fried Chicken', 65, 'Food', 'Alfamart', NULL, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400'),
    ('Ready-to-drink Coffee', 30, 'Drink', 'Alfamart', NULL, 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=400'),
    ('Instant Noodles (Cup)', 25, 'Grocery', 'Alfamart', NULL, 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400'),
    ('Bottled Water 500ml', 15, 'Drink', 'Alfamart', NULL, 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400')
) AS vals(item_name, price, category, manufacturer, brand, image_url)
CROSS JOIN merchants m
WHERE m.name LIKE 'Alfamart%'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items mi WHERE mi.merchant_id = m.id AND mi.item_name = vals.item_name
  );

-- ============================================================
-- JOLLIBEE MENU (linked to Jollibee branches missing these items)
-- ============================================================
INSERT INTO menu_items (merchant_id, item_name, price, category, manufacturer, brand, image_url)
SELECT m.id, vals.item_name, vals.price, vals.category, vals.manufacturer, vals.brand, vals.image_url
FROM (
  VALUES
    ('1-pc Chickenjoy w/ Rice', 111, 'Food', 'Jollibee', NULL, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400'),
    ('Jolly Spaghetti', 60, 'Food', 'Jollibee', NULL, 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400'),
    ('Yumburger', 40, 'Food', 'Jollibee', NULL, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'),
    ('Peach Mango Pie', 45, 'Food', 'Jollibee', NULL, 'https://images.unsplash.com/photo-1621236378699-8597faf6a176?w=400')
) AS vals(item_name, price, category, manufacturer, brand, image_url)
CROSS JOIN merchants m
WHERE m.name LIKE 'Jollibee%'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items mi WHERE mi.merchant_id = m.id AND mi.item_name = vals.item_name
  );

-- ============================================================
-- MCDONALD'S MENU (linked to every McDonald's branch)
-- ============================================================
INSERT INTO menu_items (merchant_id, item_name, price, category, manufacturer, brand, image_url)
SELECT m.id, vals.item_name, vals.price, vals.category, vals.manufacturer, vals.brand, vals.image_url
FROM (
  VALUES
    ('1-pc Chicken McDo w/ Rice', 99, 'Food', 'McDonald''s', NULL, 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400'),
    ('Big Mac', 165, 'Food', 'McDonald''s', NULL, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400'),
    ('Medium Fries', 95, 'Food', 'McDonald''s', NULL, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400'),
    ('Oreo McFlurry', 65, 'Food', 'McDonald''s', NULL, 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400')
) AS vals(item_name, price, category, manufacturer, brand, image_url)
CROSS JOIN merchants m
WHERE m.name LIKE 'McDonald''s%'
  AND NOT EXISTS (
    SELECT 1 FROM menu_items mi WHERE mi.merchant_id = m.id AND mi.item_name = vals.item_name
  );
