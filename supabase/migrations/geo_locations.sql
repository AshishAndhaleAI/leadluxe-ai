-- ============================================================
-- LeadLuxe AI — Canonical Geospatial Tables
-- Every city, property, and investment flow references these.
-- ============================================================

-- GEO LOCATIONS: Verified city/district coordinates
CREATE TABLE IF NOT EXISTS geo_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL,
  country_name text NOT NULL,
  city_name text NOT NULL,
  city_name_normalized text NOT NULL,
  district_name text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  timezone text,
  population int,
  source text NOT NULL DEFAULT 'LeadLuxe Verified',
  verification_status text NOT NULL DEFAULT 'verified',
  verified boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(country_code, city_name, district_name)
);

-- CAPITAL FLOWS: Verified investment corridors between cities
CREATE TABLE IF NOT EXISTS capital_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_city_id uuid REFERENCES geo_locations(id) ON DELETE CASCADE,
  target_city_id uuid REFERENCES geo_locations(id) ON DELETE CASCADE,
  flow_strength numeric NOT NULL DEFAULT 1.0,
  flow_type text NOT NULL DEFAULT 'capital_investment',
  source_reference text,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Index for faster geo lookups
CREATE INDEX IF NOT EXISTS idx_geo_locations_city_name ON geo_locations(city_name);
CREATE INDEX IF NOT EXISTS idx_geo_locations_country_code ON geo_locations(country_code);
CREATE INDEX IF NOT EXISTS idx_geo_locations_coords ON geo_locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_capital_flows_source ON capital_flows(source_city_id);
CREATE INDEX IF NOT EXISTS idx_capital_flows_target ON capital_flows(target_city_id);

-- Enable RLS
ALTER TABLE geo_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE capital_flows ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
DROP POLICY IF EXISTS "Anyone can read geo_locations" ON geo_locations;
CREATE POLICY "Anyone can read geo_locations"
  ON geo_locations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can read capital_flows" ON capital_flows;
CREATE POLICY "Anyone can read capital_flows"
  ON capital_flows FOR SELECT
  USING (true);
