/*
# Add logo_url/image_url columns and seed merchants, menu items, and orders

1. Schema changes
   - merchants: add `logo_url` (text, nullable) — optional merchant logo image URL.
   - menu_items: add `image_url` (text, nullable) — optional item image URL.
   Both columns are additive and nullable; no existing data is affected.

2. Seed data
   - 10 merchants across NCR, Bulacan, Calabarzon, and Dagupan regions.
   - 6 menu items linked to specific merchants (Jollibee, Puregold, IKEA, Landers, Mercury Drug).
   - 5 dummy delivery orders for the driver feed, all with status 'Available'.

3. Security
   - No RLS policy changes. All existing policies remain in place.
   - Tables already have RLS enabled with anon+authenticated CRUD policies (single-tenant, no auth).

4. Notes
   - Uses `item_name` (not `name`) for menu_items to match existing schema and app code.
   - Merchants populate both `lat`/`lng` (used by app code) and `latitude`/`longitude` (nullable columns).
   - Orders include reasonable distance values since the column is NOT NULL.
   - All inserts use ON CONFLICT DO NOTHING on matching merchant names to be idempotent.
*/

-- Add logo_url to merchants if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merchants' AND column_name = 'logo_url') THEN
    ALTER TABLE merchants ADD COLUMN logo_url text;
  END IF;
END $$;

-- Add image_url to menu_items if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'image_url') THEN
    ALTER TABLE menu_items ADD COLUMN image_url text;
  END IF;
END $$;

-- ============================================================
-- Seed merchants
-- ============================================================
INSERT INTO merchants (name, category, region, mall_name, lat, lng, latitude, longitude, is_mall_tenant, is_active)
VALUES
  ('Jollibee MOA', 'Fast Food', 'NCR', 'SM MOA', 14.5352, 120.9822, 14.5352, 120.9822, true, true),
  ('SM Aura', 'Mall', 'NCR', 'BGC', 14.5471, 121.0553, 14.5471, 121.0553, false, true),
  ('Puregold Parañaque', 'Grocery', 'NCR', NULL, 14.4800, 121.0000, 14.4800, 121.0000, false, true),
  ('Landers BGC', 'Grocery', 'NCR', 'BGC', 14.5523, 121.0504, 14.5523, 121.0504, true, true),
  ('IKEA Pasay', 'Home & Living', 'NCR', 'SM MOA', 14.5345, 120.9846, 14.5345, 120.9846, true, true),
  ('SM City Malolos', 'Mall', 'Bulacan', 'SM Malolos', 14.8443, 120.8114, 14.8443, 120.8114, false, true),
  ('SM City Dasmariñas', 'Mall', 'Calabarzon', 'SM Dasma', 14.3292, 120.9358, 14.3292, 120.9358, false, true),
  ('SM City Dagupan', 'Mall', 'Dagupan', 'SM Dagupan', 16.0433, 120.3333, 16.0433, 120.3333, false, true),
  ('Mercury Drug', 'Healthcare', 'NCR', NULL, 14.6000, 121.0000, 14.6000, 121.0000, false, true),
  ('7-Eleven', 'Convenience', 'NCR', NULL, 14.5800, 121.0000, 14.5800, 121.0000, false, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Seed menu items (linked to merchants by name)
-- ============================================================
INSERT INTO menu_items (merchant_id, item_name, price, category, manufacturer, brand)
SELECT m.id, vals.item_name, vals.price, vals.category, vals.manufacturer, vals.brand
FROM (
  VALUES
    ('Jollibee MOA',     'Chickenjoy',     111,  'Food',       'Jollibee',     NULL),
    ('Jollibee MOA',     'Yumburger',      40,   'Food',       'Jollibee',     NULL),
    ('Puregold Parañaque', 'Rice 5kg',     250,  'Grocery',    'Jasmine Gold', NULL),
    ('Puregold Parañaque', 'Cooking Oil',  80,   'Grocery',    'Datu Puti',    NULL),
    ('IKEA Pasay',       'KALLAX Shelf',   4990, 'Retail',     'IKEA',         'KALLAX'),
    ('Landers BGC',      'Prime Ribeye',   1200, 'Grocery',    'Landers',      NULL),
    ('Mercury Drug',     'Biogesic',       50,   'Pharmacy',   'United Lab',   'Biogesic')
) AS vals(merchant_name, item_name, price, category, manufacturer, brand)
JOIN merchants m ON m.name = vals.merchant_name
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items mi
  WHERE mi.merchant_id = m.id AND mi.item_name = vals.item_name
);

-- ============================================================
-- Seed 5 dummy orders for the driver feed
-- ============================================================
INSERT INTO orders (pickup, dropoff, fare, distance, vehicle_type, note, status, category, toll_fee, multi_store, payment_methods)
VALUES
  ('Jollibee MOA', 'Poblacion, Makati', 150, 8.5, 'Motorcycle', '', 'Available', 'Food', 0, false, ARRAY['Cash']),
  ('Puregold Parañaque', 'BF Homes', 250, 6.2, 'Car', '', 'Available', 'Grocery', 0, false, ARRAY['Cash']),
  ('IKEA Pasay', 'BGC', 350, 4.1, 'Van', '', 'Available', 'Retail', 0, false, ARRAY['Cash']),
  ('Landers BGC', 'Makati CBD', 200, 3.8, 'Car', '', 'Available', 'Grocery', 0, false, ARRAY['Cash']),
  ('SM Aura', 'Taguig', 180, 2.5, 'Motorcycle', '', 'Available', 'Food', 0, false, ARRAY['Cash'])
ON CONFLICT (id) DO NOTHING;
