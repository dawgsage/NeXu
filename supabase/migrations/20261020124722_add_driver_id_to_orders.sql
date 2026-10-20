/*
# Add driver_id column to orders table

1. Modified Tables
- `orders`: Added `driver_id` (uuid, nullable) column to track which driver accepted an order.
  This column is NOT a foreign key — it's a soft reference to the driver_profile table.
  No existing data is affected; all current rows get NULL for driver_id.

2. Security
- No RLS policy changes. The existing policies on orders remain unchanged.
*/

ALTER TABLE orders ADD COLUMN IF NOT EXISTS driver_id uuid;
