/*
# NeXu Merchant Expansion — Regions, Mall Tenants, New Locations

## Overview
Adds location columns to merchants, inserts BGC/Pasay/regional mall merchants,
and seeds their menu items. Does NOT drop or recreate existing tables.

## Column Additions (merchants)
- region (text, nullable) — NCR, Bulacan, Calabarzon, Dagupan
- mall_name (text, nullable) — which mall a tenant is inside
- latitude (numeric, nullable)
- longitude (numeric, nullable)
- is_mall_tenant (boolean, default false)

## New Merchants (14)
BGC area, hardware/home, regional SM malls.

## New Menu Items
Din Tai Fung, Starbucks, IKEA, Ace Hardware, Wilcon Depot.
*/

ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS mall_name text,
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric,
  ADD COLUMN IF NOT EXISTS is_mall_tenant boolean NOT NULL DEFAULT false;

-- Insert new merchants
INSERT INTO merchants (name, category, lat, lng, is_active, region, mall_name, latitude, longitude, is_mall_tenant) VALUES
  -- BGC AREA
  ('SM Aura Premier', 'Mall', 14.5471, 121.0553, true, 'NCR', 'BGC', 14.5471, 121.0553, false),
  ('Bonifacio High Street', 'Mall', 14.5536, 121.0488, true, 'NCR', 'BGC', 14.5536, 121.0488, false),
  ('Landers BGC', 'Grocery', 14.5523, 121.0504, true, 'NCR', 'BGC', 14.5523, 121.0504, false),
  ('Din Tai Fung BGC', 'Restaurant', 14.5536, 121.0488, true, 'NCR', 'Bonifacio High Street', 14.5536, 121.0488, true),
  ('Starbucks Reserve BGC', 'Restaurant', 14.5536, 121.0488, true, 'NCR', 'Bonifacio High Street', 14.5536, 121.0488, true),
  -- HARDWARE & HOME
  ('IKEA Pasay', 'Grocery', 14.5345, 120.9846, true, 'NCR', 'SM Mall of Asia', 14.5345, 120.9846, true),
  ('Ace Hardware BGC', 'Grocery', 14.5536, 121.0488, true, 'NCR', 'BGC', 14.5536, 121.0488, false),
  ('Wilcon Depot', 'Grocery', 14.5764, 121.0591, true, 'NCR', NULL, 14.5764, 121.0591, false),
  -- REGIONAL MALLS
  ('SM Mall of Asia', 'Mall', 14.5352, 120.9822, true, 'NCR', 'SM MOA', 14.5352, 120.9822, false),
  ('SM North EDSA', 'Mall', 14.6566, 121.0306, true, 'NCR', 'SM North', 14.6566, 121.0306, false),
  ('SM City Malolos', 'Mall', 14.8443, 120.8114, true, 'Bulacan', 'SM Malolos', 14.8443, 120.8114, false),
  ('SM City Marilao', 'Mall', 14.7576, 120.9485, true, 'Bulacan', 'SM Marilao', 14.7576, 120.9485, false),
  ('SM City Dasmariñas', 'Mall', 14.3292, 120.9358, true, 'Calabarzon', 'SM Dasma', 14.3292, 120.9358, false),
  ('SM City Sta. Rosa', 'Mall', 14.3153, 121.1108, true, 'Calabarzon', 'SM Sta Rosa', 14.3153, 121.1108, false),
  ('SM City Dagupan', 'Mall', 16.0433, 120.3333, true, 'Dagupan', 'SM Dagupan', 16.0433, 120.3333, false)
ON CONFLICT DO NOTHING;

-- Seed menu items for new merchants
DO $$
DECLARE
  dintaifung_id uuid; starbucks_id uuid; ikea_id uuid; ace_id uuid; wilcon_id uuid;
BEGIN
  SELECT id INTO dintaifung_id FROM merchants WHERE name = 'Din Tai Fung BGC';
  SELECT id INTO starbucks_id FROM merchants WHERE name = 'Starbucks Reserve BGC';
  SELECT id INTO ikea_id FROM merchants WHERE name = 'IKEA Pasay';
  SELECT id INTO ace_id FROM merchants WHERE name = 'Ace Hardware BGC';
  SELECT id INTO wilcon_id FROM merchants WHERE name = 'Wilcon Depot';

  INSERT INTO menu_items (merchant_id, item_name, price, manufacturer, brand, category) VALUES
    (dintaifung_id, 'Xiao Long Bao', 250, 'Din Tai Fung', 'Din Tai Fung', 'Food'),
    (starbucks_id, 'Reserve Cold Brew', 220, 'Starbucks Coffee', 'Starbucks Reserve', 'Drink'),
    (ikea_id, 'KALLAX Shelf', 4990, 'IKEA', 'IKEA', 'Retail'),
    (ikea_id, 'POÄNG Chair', 6990, 'IKEA', 'IKEA', 'Retail'),
    (ace_id, 'Hammer', 350, 'Ace Hardware', 'Ace Hardware', 'Retail'),
    (ace_id, 'Screwdriver Set', 499, 'Ace Hardware', 'Ace Hardware', 'Retail'),
    (wilcon_id, 'Boysen Paint', 1250, 'Boysen', 'Boysen', 'Retail');
END $$;
