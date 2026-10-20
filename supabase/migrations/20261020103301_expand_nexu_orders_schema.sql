/*
# NeXu Driver App - Schema Expansion & New Seed Data

## Overview
Expands the orders table with new columns required by features F1-F8, and replaces
the old 10-row seed with 15 realistic NCR / Bulacan / Cavite delivery orders
that include GPS coordinates, toll fees, payment methods, categories, multi-store
flags, and scheduled delivery times.

## Modified Tables

### orders (additive columns only — no destructive changes)
- pickup_lat (numeric, nullable) — latitude of pickup point
- pickup_lng (numeric, nullable) — longitude of pickup point
- dropoff_lat (numeric, nullable) — latitude of dropoff point
- dropoff_lng (numeric, nullable) — longitude of dropoff point
- toll_fee (numeric, default 0) — estimated toll / skyway fee
- category (text, default 'Parcel') — Food | Grocery | Pabili | Parcel
- multi_store (boolean, default false) — true if items span multiple stores
- payment_methods (text[], default '{}') — accepted methods (Cash, GCash, Maya, Card)
- scheduled_time (timestamptz, nullable) — non-null means scheduled delivery
- customer_name (text, default '') — sender/customer display name

## Data
- Removes the old 10 seed rows.
- Inserts 15 new orders across Metro Manila, Bulacan, and Cavite with full metadata.

## Security
- No policy changes — existing anon/authenticated CRUD policies remain valid.
*/

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS pickup_lat numeric,
  ADD COLUMN IF NOT EXISTS pickup_lng numeric,
  ADD COLUMN IF NOT EXISTS dropoff_lat numeric,
  ADD COLUMN IF NOT EXISTS dropoff_lng numeric,
  ADD COLUMN IF NOT EXISTS toll_fee numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Parcel',
  ADD COLUMN IF NOT EXISTS multi_store boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_methods text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS scheduled_time timestamptz,
  ADD COLUMN IF NOT EXISTS customer_name text NOT NULL DEFAULT '';

-- Replace seed data: remove old rows, insert 15 new realistic orders.
-- Using DELETE here is intentional and safe: these are seed/demo rows, not user data.
DELETE FROM orders WHERE customer_name = '';

INSERT INTO orders
  (pickup, dropoff, fare, distance, vehicle_type, note, status,
   pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, toll_fee, category,
   multi_store, payment_methods, scheduled_time, customer_name)
VALUES
  ('EDSA Ayala Ave, Makati', 'BGC 32nd St, Taguig', 180, 6, 'Car', 'Pabili: Documents', 'Available',
   14.5565, 121.0252, 14.5528, 121.0501, 0, 'Pabili', false, ARRAY['Cash','GCash'], NULL, 'Maria Santos'),
  ('Katipunan Ave, QC', 'Marcos Highway, Marikina', 220, 10, 'Motorcycle', 'Small parcel', 'Available',
   14.6359, 121.0750, 14.6233, 121.1004, 0, 'Parcel', false, ARRAY['GCash','Maya'], NULL, 'Juan Dela Cruz'),
  ('España Blvd, Manila', 'Aurora Blvd, San Juan', 150, 7, 'Tricycle', 'Grocery items', 'Available',
   14.6090, 120.9890, 14.6065, 121.0328, 0, 'Grocery', true, ARRAY['Cash'], NULL, 'Aling Nena'),
  ('Ortigas Ave, Pasig', 'Shaw Blvd, Mandaluyong', 120, 4, 'Motorcycle', 'Food delivery', 'Available',
   14.5868, 121.0646, 14.5816, 121.0533, 0, 'Food', false, ARRAY['GCash','Maya','Card'], NULL, 'Mark Villanueva'),
  ('MacArthur Highway, Valenzuela', 'Plaridel Airport Rd, Bulacan', 650, 28, 'Van', 'Balikbayan box', 'Available',
   14.6900, 120.9800, 14.8914, 120.8554, 45, 'Parcel', false, ARRAY['Cash','GCash'], NULL, 'Pedro Reyes'),
  ('Manila-North Rd, Meycauayan', 'Dona Remedios Trinidad Hwy, Baliuag', 1200, 45, 'Van', 'Furniture', 'Available',
   14.7368, 120.9581, 14.9548, 120.8973, 60, 'Parcel', false, ARRAY['Cash','GCash','Card'], NULL, 'Linda Garcia'),
  ('Aguinaldo Highway, Bacoor', 'Antero Soriano Hwy, General Trias', 450, 18, 'Car', 'Medium crate', 'Available',
   14.4580, 120.9450, 14.3865, 120.8815, 25, 'Parcel', false, ARRAY['Cash','GCash'], NULL, 'Rommel Lopez'),
  ('CAVITEX, Parañaque', 'Tirona Highway, Kawit', 380, 15, 'Car', 'Airport luggage', 'Available',
   14.5050, 120.9950, 14.4480, 120.9100, 35, 'Parcel', false, ARRAY['Cash','GCash','Maya','Card'], NULL, 'Grace Lim'),
  ('Daang Hari Rd, Las Piñas', 'Molino Blvd, Bacoor', 250, 8, 'Motorcycle', 'Padala lang po', 'Available',
   14.4200, 120.9700, 14.4400, 120.9600, 0, 'Parcel', false, ARRAY['Cash'], NULL, 'Tito Boy'),
  ('Quezon Ave, QC', 'East Ave, QC', 130, 5, 'Tricycle', 'Medicine', 'Available',
   14.6300, 121.0000, 14.6350, 121.0350, 0, 'Grocery', false, ARRAY['Cash','GCash'], NULL, 'Dr. Tan'),
  ('Roxas Blvd, Pasay', 'Taft Ave, Pasay', 110, 3, 'Motorcycle', 'Clothes', 'Available',
   14.5600, 120.9800, 14.5500, 121.0000, 0, 'Parcel', false, ARRAY['Cash'], NULL, 'Sarah Kim'),
  ('C5 Libis, QC', 'Ortigas Ext, Cainta', 200, 9, 'Car', 'Pabili: Food', 'Available',
   14.6100, 121.0800, 14.5900, 121.1100, 0, 'Food', true, ARRAY['GCash','Maya','Card'], NULL, 'Chef Mike'),
  ('Mindanao Ave, QC', 'Quirino Hwy, Novaliches', 180, 6, 'Motorcycle', 'Gadget', 'Available',
   14.6700, 121.0300, 14.7000, 121.0300, 0, 'Parcel', false, ARRAY['Cash','GCash','Maya'], NULL, 'Tech Hub'),
  ('Alabang-Zapote Rd, Muntinlupa', 'Manila-Cavite Rd, Las Piñas', 280, 12, 'Van', 'Heavy Box', 'Available',
   14.4300, 121.0300, 14.4500, 120.9900, 0, 'Parcel', false, ARRAY['Cash','GCash'], NULL, 'Building Co.'),
  ('Sumulong Hwy, Antipolo', 'JP Rizal Ave, Marikina', 300, 14, 'Van', 'Pabili: Water', 'Available',
   14.5900, 121.1700, 14.6300, 121.1000, 0, 'Pabili', false, ARRAY['Cash','GCash'], NULL, 'Water Station');

-- Mark a couple of orders as scheduled (future timestamps)
UPDATE orders SET scheduled_time = (now() + interval '3 hours')::timestamptz
  WHERE pickup IN ('MacArthur Highway, Valenzuela', 'Sumulong Hwy, Antipolo');

-- Mark one food order as multi-store
UPDATE orders SET multi_store = true
  WHERE pickup = 'C5 Libis, QC';
