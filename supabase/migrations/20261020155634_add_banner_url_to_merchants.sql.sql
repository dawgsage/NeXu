ALTER TABLE merchants ADD COLUMN IF NOT EXISTS banner_url text;

-- Convenience store banners (7-Eleven, Alfamart)
UPDATE merchants SET banner_url = 'https://images.pexels.com/photos/34357798/pexels-photo-34357798.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
WHERE category = 'Convenience' AND banner_url IS NULL;

-- Fast food banners (Jollibee, McDonald's, Din Tai Fung, etc.)
UPDATE merchants SET banner_url = 'https://images.pexels.com/photos/34407059/pexels-photo-34407059.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
WHERE category = 'Fast Food' AND banner_url IS NULL;

-- Cafe banners (Starbucks, Bank Bar, Kape Tayo, Wildflour)
UPDATE merchants SET banner_url = 'https://images.pexels.com/photos/6612572/pexels-photo-6612572.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
WHERE category = 'Cafe' AND banner_url IS NULL;

-- Grocery banners (Puregold, Landers, Walter Mart, Mercury Drug Malolos, Dagupan Wet Market)
UPDATE merchants SET banner_url = 'https://images.pexels.com/photos/4124939/pexels-photo-4124939.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
WHERE category = 'Grocery' AND banner_url IS NULL;

-- Hardware banners (Ace Hardware, Malolos Hardware, Wilcon)
UPDATE merchants SET banner_url = 'https://images.pexels.com/photos/38575493/pexels-photo-38575493.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
WHERE category = 'Hardware' AND banner_url IS NULL;

-- Mall banners (SM, Ayala, etc.)
UPDATE merchants SET banner_url = 'https://images.pexels.com/photos/37274790/pexels-photo-37274790.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
WHERE category = 'Mall' AND banner_url IS NULL;

-- Karenderia banners
UPDATE merchants SET banner_url = 'https://images.pexels.com/photos/20089299/pexels-photo-20089299.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
WHERE category = 'Karenderia' AND banner_url IS NULL;

-- Healthcare / Pharmacy banners
UPDATE merchants SET banner_url = 'https://images.pexels.com/photos/17976150/pexels-photo-17976150.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
WHERE category = 'Healthcare' AND banner_url IS NULL;

-- Home & Living banners (IKEA)
UPDATE merchants SET banner_url = 'https://images.pexels.com/photos/7535062/pexels-photo-7535062.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
WHERE category = 'Home & Living' AND banner_url IS NULL;

-- Restaurant banners (Chowking, Mang Inasal, etc.)
UPDATE merchants SET banner_url = 'https://images.pexels.com/photos/12181619/pexels-photo-12181619.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
WHERE category = 'Restaurant' AND banner_url IS NULL;

-- Catch any remaining NULLs with a generic food image
UPDATE merchants SET banner_url = 'https://images.pexels.com/photos/4109233/pexels-photo-4109233.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
WHERE banner_url IS NULL;
