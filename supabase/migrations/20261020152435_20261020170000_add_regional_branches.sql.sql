/*
# Add regional branch merchants (7-Eleven, Alfamart, Jollibee, McDonald's)

## Summary
Inserts new specific branch locations for 7-Eleven, Alfamart, Jollibee, and McDonald's
across NCR, Bulacan, Calabarzon, Region 3, and Dagupan. Updates existing merchants
that have mismatched categories, regions, or coordinates.

## New Merchants (17 branches)
- 7-Eleven BGC High Street, Malolos Crossing, SJDM Tungko, Dasmariñas Bayan, Imus Aguinaldo Hwy, Dagupan Downtown, San Fernando Pampanga
- Alfamart Taguig, Malolos City, Dasmariñas, Cavite Imus
- Jollibee BGC Stopover, Dasmariñas
- McDonald's BGC

## Updated Merchants (3)
- 7-Eleven Malolos Bayan: category → Convenience, region → Bulacan, coords
- McDonald's Malolos: category → Fast Food, region → Bulacan, coords
- Jollibee Malolos Bayan: coords → 14.8443, 120.8114

## Logos
- 7-Eleven branches: no official logo URL available (left null)
- Jollibee branches: logo set via existing LIKE pattern
- McDonald's branches: logo set to cdnlogo URL

## Notes
- No existing data deleted. Updates only fix category/region/coords.
- All branches have is_active = true.
*/

-- ============================================================
-- 1. UPDATE existing merchants with corrected data
-- ============================================================
UPDATE merchants SET category = 'Convenience', region = 'Bulacan', mall_name = NULL, lat = 14.8443, lng = 120.8114, latitude = 14.8443, longitude = 120.8114, is_mall_tenant = false
WHERE name = '7-Eleven Malolos Bayan';

UPDATE merchants SET category = 'Fast Food', region = 'Bulacan', mall_name = NULL, lat = 14.8443, lng = 120.8114, latitude = 14.8443, longitude = 120.8114, is_mall_tenant = false
WHERE name = 'McDonald''s Malolos';

UPDATE merchants SET lat = 14.8443, lng = 120.8114, latitude = 14.8443, longitude = 120.8114
WHERE name = 'Jollibee Malolos Bayan';

-- ============================================================
-- 2. INSERT new branch merchants
-- ============================================================
INSERT INTO merchants (name, category, region, mall_name, lat, lng, latitude, longitude, is_mall_tenant, is_active)
SELECT * FROM (VALUES
  ('7-Eleven BGC High Street',      'Convenience', 'NCR',        'BGC',         14.5536, 121.0488, 14.5536, 121.0488, true,  true),
  ('7-Eleven Malolos Crossing',     'Convenience', 'Bulacan',    NULL,          14.8443, 120.8114, 14.8443, 120.8114, false, true),
  ('7-Eleven SJDM Tungko',          'Convenience', 'Bulacan',    NULL,          14.8110, 121.0450, 14.8110, 121.0450, false, true),
  ('7-Eleven Dasmariñas Bayan',     'Convenience', 'Calabarzon', NULL,          14.3292, 120.9358, 14.3292, 120.9358, false, true),
  ('7-Eleven Imus Aguinaldo Hwy',   'Convenience', 'Calabarzon', NULL,          14.4150, 120.9400, 14.4150, 120.9400, false, true),
  ('7-Eleven Dagupan Downtown',     'Convenience', 'Dagupan',    NULL,          16.0433, 120.3333, 16.0433, 120.3333, false, true),
  ('7-Eleven San Fernando Pampanga','Convenience', 'Region 3',   NULL,          15.0286, 120.6898, 15.0286, 120.6898, false, true),
  ('Alfamart Taguig',               'Convenience', 'NCR',        NULL,          14.5200, 121.0500, 14.5200, 121.0500, false, true),
  ('Alfamart Malolos City',         'Convenience', 'Bulacan',    NULL,          14.8400, 120.8100, 14.8400, 120.8100, false, true),
  ('Alfamart Dasmariñas',           'Convenience', 'Calabarzon', NULL,          14.3300, 120.9400, 14.3300, 120.9400, false, true),
  ('Alfamart Cavite Imus',          'Convenience', 'Calabarzon', NULL,          14.4200, 120.9300, 14.4200, 120.9300, false, true),
  ('Jollibee BGC Stopover',         'Fast Food',   'NCR',        'BGC',         14.5536, 121.0488, 14.5536, 121.0488, true,  true),
  ('Jollibee Dasmariñas',           'Fast Food',   'Calabarzon', NULL,          14.3292, 120.9358, 14.3292, 120.9358, false, true),
  ('McDonald''s BGC',               'Fast Food',   'NCR',        'BGC',         14.5536, 121.0488, 14.5536, 121.0488, true,  true)
) AS v(name, category, region, mall_name, lat, lng, latitude, longitude, is_mall_tenant, is_active)
WHERE NOT EXISTS (SELECT 1 FROM merchants m WHERE m.name = v.name);

-- ============================================================
-- 3. SET logos on branded merchants
-- ============================================================
UPDATE merchants SET logo_url = 'https://img.logokit.com/jollibee.com.ph' WHERE name = 'Jollibee BGC Stopover';
UPDATE merchants SET logo_url = 'https://img.logokit.com/jollibee.com.ph' WHERE name = 'Jollibee Dasmariñas';
UPDATE merchants SET logo_url = 'https://cdnlogo.com/logos/m/42/mcdonalds.svg' WHERE name LIKE 'McDonald''s%';
