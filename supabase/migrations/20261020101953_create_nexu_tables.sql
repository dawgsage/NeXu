/*
# NeXu Driver App - Initial Schema

## Overview
Creates the core tables for the NeXu delivery driver application used by Filipino drivers.

## New Tables

### orders
- id (uuid, primary key) — unique order identifier
- pickup (text) — pickup location description
- dropoff (text) — dropoff location description
- fare (numeric) — fare amount in Philippine Pesos
- distance (numeric) — distance in kilometers
- vehicle_type (text) — required vehicle type (Motorcycle, Car, Tricycle, Van)
- note (text) — special instructions from the customer
- status (text) — order lifecycle status: Available, Accepted, Delivered
- created_at (timestamptz) — record creation timestamp

### driver_profile
- id (uuid, primary key) — driver profile identifier
- vehicle (text) — driver's vehicle type
- status (text) — driver availability status
- created_at (timestamptz) — record creation timestamp

## Security
- RLS enabled on both tables.
- Anon + authenticated roles can perform full CRUD (no-auth app, data is shared).

## Seed Data
10 sample delivery orders across Metro Manila and surrounding areas are inserted on creation.
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup text NOT NULL,
  dropoff text NOT NULL,
  fare numeric NOT NULL,
  distance numeric NOT NULL,
  vehicle_type text NOT NULL,
  note text DEFAULT '',
  status text NOT NULL DEFAULT 'Available',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_delete_orders" ON orders FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS driver_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle text NOT NULL,
  status text NOT NULL DEFAULT 'Online',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE driver_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_driver_profile" ON driver_profile;
CREATE POLICY "anon_select_driver_profile" ON driver_profile FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_driver_profile" ON driver_profile;
CREATE POLICY "anon_insert_driver_profile" ON driver_profile FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_driver_profile" ON driver_profile;
CREATE POLICY "anon_update_driver_profile" ON driver_profile FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_driver_profile" ON driver_profile;
CREATE POLICY "anon_delete_driver_profile" ON driver_profile FOR DELETE
  TO anon, authenticated USING (true);

-- Seed 10 sample orders (idempotent: only insert if table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM orders LIMIT 1) THEN
    INSERT INTO orders (pickup, dropoff, fare, distance, vehicle_type, note, status) VALUES
      ('BGC, Taguig', 'Poblacion, Makati', 150, 5, 'Motorcycle', 'Padala lang po, maliit na box.', 'Available'),
      ('UP Diliman, Quezon City', 'Concepcion, Marikina', 180, 8, 'Motorcycle', 'Documents lang po, sealed.', 'Available'),
      ('SM Mall of Asia, Pasay', 'NAIA Terminal 3, Pasay', 250, 3, 'Car', 'Airport transfer, 1 passenger.', 'Available'),
      ('Ayala Center, Makati', 'Dasmariñas, Cavite', 1200, 35, 'Van', 'Balikbayan box, heavy.', 'Available'),
      ('Trinoma, Quezon City', 'San Fernando, Pampanga', 2000, 60, 'Van', 'Medium crate, need space.', 'Available'),
      ('Valenzuela City Hall', 'Meycauayan, Bulacan', 280, 10, 'Tricycle', 'Grocery items, 2 bags.', 'Available'),
      ('Ortigas Center, Pasig', 'Burnham Park, Baguio', 8500, 250, 'Van', 'Furniture delivery, long haul.', 'Available'),
      ('Festival Mall, Alabang', 'BF Homes, Las Piñas', 160, 7, 'Motorcycle', 'Food delivery, handle with care.', 'Available'),
      ('Antipolo Cathedral', 'SM City Marikina', 200, 12, 'Car', 'Pabili po, packed na.', 'Available'),
      ('Robinsons Place Manila', 'SM North EDSA, QC', 220, 14, 'Motorcycle', 'Small parcel po, thank you!', 'Available');
  END IF;
END $$;
