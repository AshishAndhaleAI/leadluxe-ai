-- ============================================================
-- LeadLuxe AI — Verified Locations & Ingestion Tracking
-- Tracks every geocoded location, its source, and the
-- ingestion pipeline that discovered it.
-- ============================================================

-- VERIFIED LOCATIONS: Every geocoded property/city/project
CREATE TABLE IF NOT EXISTS verified_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  country_code text NOT NULL,
  country_name text NOT NULL,
  city_name text NOT NULL,
  city_name_normalized text NOT NULL,
  district_name text,
  
  -- Coordinates (exact)
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  
  -- Geocoding metadata
  geocode_source text NOT NULL DEFAULT 'leadluxe_verified',
  -- nomintim | photon | verified_map | manual
  geocode_confidence numeric DEFAULT 0,
  geocode_raw_response jsonb,
  bounding_box jsonb, -- [minLat, maxLat, minLng, maxLng]
  
  -- Verification
  verification_status text NOT NULL DEFAULT 'verified',
  -- verified | plausible | unverified | failed
  verified_at timestamptz DEFAULT now(),
  verified_by text DEFAULT 'system',
  
  -- Ingestion tracking
  ingestion_run_id uuid,
  source_url text,
  source_name text,
  
  -- Stats
  linked_projects int DEFAULT 0,
  linked_signals int DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  UNIQUE(country_code, city_name, district_name)
);

-- INGESTION RUNS: Track each ingestion pipeline execution
CREATE TABLE IF NOT EXISTS ingestion_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'running',
  -- running | completed | failed | partial
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  sources_attempted int DEFAULT 0,
  sources_succeeded int DEFAULT 0,
  sources_failed int DEFAULT 0,
  locations_geocoded int DEFAULT 0,
  locations_failed int DEFAULT 0,
  locations_deduplicated int DEFAULT 0,
  error_log jsonb DEFAULT '[]'::jsonb,
  summary text
);

-- INGESTION SOURCES: Track each data source fetch
CREATE TABLE IF NOT EXISTS ingestion_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid REFERENCES ingestion_runs(id) ON DELETE CASCADE,
  source_name text NOT NULL,
  source_url text,
  status text NOT NULL DEFAULT 'pending',
  -- pending | fetching | completed | failed
  records_fetched int DEFAULT 0,
  records_geocoded int DEFAULT 0,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz
);

-- FAILED GEOCODES: Track what couldn't be geocoded for retry
CREATE TABLE IF NOT EXISTS failed_geocodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  country_code text,
  city_name text,
  error_reason text,
  attempt_count int DEFAULT 1,
  last_attempt_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_verified_locations_city ON verified_locations(city_name_normalized);
CREATE INDEX IF NOT EXISTS idx_verified_locations_country ON verified_locations(country_code);
CREATE INDEX IF NOT EXISTS idx_verified_locations_coords ON verified_locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_verified_locations_status ON verified_locations(verification_status);
CREATE INDEX IF NOT EXISTS idx_ingestion_runs_status ON ingestion_runs(status);
CREATE INDEX IF NOT EXISTS idx_failed_geocodes_city ON failed_geocodes(city_name);

-- Enable RLS
ALTER TABLE verified_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_geocodes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated reads
CREATE POLICY "Anyone can read verified_locations" ON verified_locations
  FOR SELECT USING (true);
CREATE POLICY "Anyone can read ingestion_runs" ON ingestion_runs
  FOR SELECT USING (true);
CREATE POLICY "Anyone can read ingestion_sources" ON ingestion_sources
  FOR SELECT USING (true);
CREATE POLICY "Anyone can read failed_geocodes" ON failed_geocodes
  FOR SELECT USING (true);
